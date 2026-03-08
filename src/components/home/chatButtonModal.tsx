"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Search } from "lucide-react";
import ChatModal from "./chatModal";
import { getConversations } from "@/src/services/chat/getConversation";
import { supabase } from "@/src/lib/supabase";
import { markAsReadMessage } from "@/src/services/chat/markAsReadMessage";

type Conversation = {
  conversation_id: string;
  full_name: string;
  avatar: string | null;
  last_message: string | null;
  last_message_sender_id: string | null;
  is_read: boolean;
  is_host?: boolean;
  last_message_time?: string | null;
};

export default function ChatButton() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const activeChatRef = useRef<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    const initAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      setCurrentUserId(user?.id ?? null);
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const user = session?.user;

        if (user) {
          setCurrentUserId(user.id);
        } else {
          setCurrentUserId(null);
          setConversations([]);
          setActiveChat(null);
        }
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    const loadConversations = async () => {
      const data = await getConversations(currentUserId);

      if (!data) return;

      const formatted = data.map((conv: any) => {
        const otherUser =
          conv.host.id === currentUserId ? conv.guest : conv.host;

        const lastMessage = conv.messages?.[0];

        return {
          conversation_id: conv.id,
          full_name: otherUser.full_name || "User",
          avatar: otherUser.avatar_url,
          last_message: conv.last_message_content,
          last_message_sender_id: lastMessage?.sender_id,
          last_message_time: lastMessage?.created_at,
          is_read: lastMessage?.is_read ?? true,
          is_host: conv.host_id === currentUserId,
        };
      });

      setConversations(
        formatted.sort(
          (a, b) =>
            new Date(b.last_message_time ?? 0).getTime() -
            new Date(a.last_message_time ?? 0).getTime(),
        ),
      );
    };

    loadConversations();
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel("conversation-updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMsg: any = payload.new;
          setConversations((prev) => {
            const updated = prev.map((conv) =>
              conv.conversation_id === newMsg.conversation_id
                ? {
                    ...conv,
                    last_message: newMsg.content,
                    last_message_sender_id: newMsg.sender_id,
                    last_message_time: newMsg.created_at,
                    // Mark as read if: current user sent it, or chat modal is already open for this conversation
                    is_read:
                      newMsg.sender_id === currentUserId ||
                      activeChatRef.current?.conversation_id ===
                        newMsg.conversation_id,
                  }
                : conv,
            );

            return updated.sort(
              (a, b) =>
                new Date(b.last_message_time ?? 0).getTime() -
                new Date(a.last_message_time ?? 0).getTime(),
            );
          });
        },
      )

      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversations",
        },
        async () => {
          const data = await getConversations(currentUserId);

          if (!data) return;

          const formatted = data.map((conv: any) => {
            const otherUser =
              conv.host.id === currentUserId ? conv.guest : conv.host;

            const lastMessage = conv.messages?.[0];

            return {
              conversation_id: conv.id,
              full_name: otherUser.full_name || "User",
              avatar: otherUser.avatar_url,
              last_message: conv.last_message_content,
              last_message_sender_id: lastMessage?.sender_id,
              last_message_time: lastMessage?.created_at,
              is_read: lastMessage?.is_read ?? true,
              is_host: conv.host_id === currentUserId,
            };
          });

          setConversations(formatted);
        },
      )

      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [currentUserId]);

  const filteredConversations = conversations.filter((c) =>
    c.full_name?.toLowerCase().includes(search.toLowerCase().trim()),
  );

  const unreadCount = conversations.filter(
    (chat) => !chat.is_read && chat.last_message_sender_id !== currentUserId,
  ).length;

  const markConversationRead = async (conversationId: string) => {
    if (!currentUserId) return;

    try {
      await markAsReadMessage(conversationId, currentUserId);

      setConversations((prev) =>
        prev.map((c) =>
          c.conversation_id === conversationId ? { ...c, is_read: true } : c,
        ),
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#328E6E]
        shadow-lg flex items-center justify-center cursor-pointer
        z-50 hover:scale-110 transition"
      >
        <MessageCircle className="text-white" size={28} />

        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 bg-red-500 text-white
          text-xs w-5 h-5 rounded-full flex items-center justify-center"
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 h-[420px] bg-white rounded-xl shadow-xl border z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-bold text-2xl">Chats</h3>

            <button
              className="hover:bg-gray-200 p-1 cursor-pointer transition rounded-full"
              onClick={() => setOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Search */}
          <div className="p-3 border-b">
            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
              <Search size={16} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search messages..."
                className="bg-transparent outline-none ml-2 text-sm w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {!currentUserId ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageCircle size={40} />
                <p className="mt-2 text-sm font-semibold">
                  Please Login to see your conversations
                </p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <MessageCircle size={40} />
                <p className="mt-2 text-sm">No messages yet</p>
                <p className="text-xs">Start a conversation</p>
              </div>
            ) : (
              filteredConversations.map((chat) => {
                const isUnread =
                  !chat.is_read &&
                  chat.last_message_sender_id !== currentUserId;

                return (
                  <div
                    key={chat.conversation_id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setActiveChat(chat);
                      setOpen(false);
                      markConversationRead(chat.conversation_id);
                    }}
                  >
                    <img
                      src={chat.avatar || "/default-avatar.png"}
                      alt="avatar"
                      className="w-12 h-12 rounded-full object-cover"
                    />

                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-sm">
                        {chat.full_name}

                        {!chat.is_host && (
                          <span className="ml-1 text-green-600 font-semibold text-xs border border-green-200 bg-green-200 rounded-full px-2 py-0.5">
                            Host
                          </span>
                        )}
                      </span>

                      <span
                        className={`text-xs truncate max-w-[180px] ${
                          isUnread
                            ? "font-semibold text-gray-900"
                            : "text-gray-500"
                        }`}
                      >
                        {`${chat.last_message_sender_id === currentUserId ? "You: " : ""}${
                          chat.last_message === "Sent an image"
                            ? "Sent an image"
                            : (chat.last_message ?? "")
                        }`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeChat && (
        <ChatModal chat={activeChat} onClose={() => setActiveChat(null)} />
      )}
    </>
  );
}
