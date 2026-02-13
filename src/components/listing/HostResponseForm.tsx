// trietcmce180982_sprint2

import React, { useState } from "react";
import { supabase } from "@/src/lib/supabase";

interface HostResponseFormProps {
  reviewId: string;
  hostId: string;
  onSuccess?: () => void;
}

export default function HostResponseForm({ reviewId, hostId, onSuccess }: HostResponseFormProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error: responseError } = await supabase
        .from("responses")
        .insert([
          {
            review_id: reviewId,
            host_id: hostId,
            content,
            created_at: new Date().toISOString(),
          },
        ]);
      if (responseError) throw responseError;
      setContent("");
      if (onSuccess) onSuccess();
    } catch (err) {
      let msg = "Lỗi gửi phản hồi";
      if (err && typeof err === "object" && "message" in err) {
        msg = (err as any).message || msg;
      }
      setError(msg);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg bg-gray-50">
      <div className="mb-2">
        <label className="block font-semibold mb-1">Phản hồi của chủ nhà:</label>
        <textarea
          className="w-full border rounded p-2"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <button
        type="submit"
        className="bg-[#328E6E] text-white px-4 py-2 rounded hover:bg-[#256b52]"
        disabled={loading}
      >
        {loading ? "Đang gửi..." : "Gửi phản hồi"}
      </button>
    </form>
  );
}
