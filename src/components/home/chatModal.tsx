"use client";

import { X, SendHorizontal, ImageUp } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { getMessage } from "@/src/services/chat/getMessage";
import { sendMessage } from "@/src/services/chat/sendMessage";
import { markAsReadMessage } from "@/src/services/chat/markAsReadMessage";
import { supabase } from "@/src/lib/supabase";
import { uploadChatImage } from "@/src/services/chat/uploadChatImage";

type Chat = {
  conversation_id: string;
  full_name: string;
  avatar: string;
  is_host: boolean;
};

type Message = {
  id?: string;
  sender_id: string;
  content: string;
  created_at?: string;
  is_read?: boolean;
  image_url?: string;
};

interface ChatModalProps {
  chat: Chat;
  onClose: () => void;
}

export default function ChatModal({ chat, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const currentUserIdRef = useRef<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setCurrentUserId(user?.id || null);
      currentUserIdRef.current = user?.id || null;
    };

    getUser();
  }, []);

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (time?: string) => {
    if (!time) return;

    return new Date(time).toLocaleDateString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!currentUserId) return;

    if (imageFile) {
      const imageUrl = await uploadChatImage(imageFile, currentUserId);

      if (!imageUrl) return;

      await sendMessage(chat.conversation_id, currentUserId, "", imageUrl);

      setImageFile(null);
      setImagePreview(null);
    }

    if (!newMessage.trim() || !currentUserId) return;

    await sendMessage(chat.conversation_id, currentUserId, newMessage);

    setNewMessage("");
  };

  useEffect(() => {
    if (!currentUserId) return;
    markAsReadMessage(chat.conversation_id, currentUserId);
  }, [chat.conversation_id, currentUserId]);

  useEffect(() => {
    const loadMessage = async () => {
      const data = await getMessage(chat.conversation_id);

      if (data) {
        setMessages(data);
      }
    };

    loadMessage();
  }, [chat.conversation_id]);

  useEffect(() => {
    const channel = supabase
      .channel("chat-room")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${chat.conversation_id}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;

          setMessages((prev) => [...prev, newMessage]);

          // If the message is from the other user and chat is open, mark as read immediately
          if (
            newMessage.sender_id !== currentUserIdRef.current &&
            currentUserIdRef.current
          ) {
            markAsReadMessage(chat.conversation_id, currentUserIdRef.current);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${chat.conversation_id}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;

          // Update is_read status for the matching message in local state
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === updatedMessage.id
                ? { ...msg, is_read: updatedMessage.is_read }
                : msg,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [chat.conversation_id]);

  return (
    <div className="fixed bottom-6 right-[5.5rem] w-80 h-[420px] bg-white rounded-xl shadow-xl border z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <img
            src={chat.avatar || "/default-avatar.png"}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          <h3 className="font-semibold text-lg">{chat.full_name}</h3>
          {!chat.is_host && (
            <span className="mt-1 text-green-600 font-semibold text-xs border border-green-200 bg-green-200 rounded-full px-2 py-0.5">
              Host
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          className="hover:bg-gray-200 p-1 cursor-pointer transition-all duration-300 rounded-full"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <img
              src={chat.avatar || "/default-avatar.png"}
              className="w-16 h-16 rounded-full object-cover mb-2"
            />

            <p className="font-semibold">{chat.full_name}</p>

            <p className="text-xs mt-1">No messages yet</p>

            <p className="text-xs text-gray-400">
              Send a message to start the conversation
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMine = msg.sender_id === currentUserId;
            const isLast = index === messages.length - 1;

            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[70%] ${
                  isMine ? "self-end items-end" : "self-start items-start"
                }`}
              >
                {!isMine && (
                  <span className="text-xs text-gray-500 mb-1">
                    {chat.full_name}
                  </span>
                )}

                <div
                  className={`rounded-lg px-3 py-2 ${
                    isMine
                      ? "bg-[#328E6E] text-white"
                      : "bg-gray-200 text-gray-900"
                  }`}
                >
                  {msg.image_url ? (
                    <img
                      src={msg.image_url}
                      className="rounded-lg max-w-[200px]"
                    />
                  ) : (
                    msg.content
                  )}
                </div>

                <span className="text-[10px] text-gray-400 mt-1">
                  {formatTime(msg.created_at)}
                </span>

                {isMine && isLast && (
                  <span className="text-[10px] text-gray-400">
                    {msg.is_read ? "Read" : "Sent"}
                  </span>
                )}
              </div>
            );
          })
        )}

        <div ref={messageEndRef} />
      </div>

      {imagePreview && (
        <div className="relative p-2 border-t">
          <img src={imagePreview} className="max-h-32 rounded-lg" />

          <button
            onClick={() => {
              setImagePreview(null);
              setImageFile(null);
            }}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t flex gap-2">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          id="imageUpload"
          onChange={handleUploadImage}
        />

        <label
          htmlFor="imageUpload"
          className="cursor-pointer hover:text-gray-500"
        >
          <ImageUp className="mt-2" />
        </label>

        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 border rounded-lg px-3 py-2 outline-none text-sm"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        <button
          onClick={handleSend}
          className="hover:text-gray-500 cursor-pointer transition-colors duration-300"
        >
          <SendHorizontal />
        </button>
      </div>
    </div>
  );
}
