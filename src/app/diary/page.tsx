"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import type { User, Post } from "@/types";

import { supabase } from "../../lib/supabaseClient";

/* ---------- 日本語・スペース・記号を含まない安全なキーを生成 ---------- */
const toSafeKey = (file: File, uid: string) => {
  const ext = file.name.split(".").pop() ?? "bin"; // 拡張子を抽出
  const timestamp = Date.now(); // 一意性確保
  return `${uid}/${timestamp}.${ext}`; // 例) 123/1710000000000.jpg
};

export default function DiaryPage() {
  /* ---------------- State ---------------- */
  const [user, setUser] = useState<User | null>(null);
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  /* ---------------- Auth check ---------------- */
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        window.location.href = "/login";
      } else {
        // ここで型を合わせる！
        setUser({
          id: user.id,
          email: user.email ?? null, // undefinedをnullに変換してる
        });
        fetchPosts();
      }
    });
  }, []);

  /* ---------------- Fetch posts ---------------- */
  const fetchPosts = useCallback(async () => {
    const { data } = (await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false }) // 👈 ここが「新しい順」に並べる設定
      .throwOnError()) as { data: Post[] | null };

    setPosts(data || []);
  }, []);

  /* ---------------- Handle post ---------------- */
  const handlePost = async () => {
    if (!content && !imageFile) return;

    let image_url: string | null = null;

    /* ---- 画像アップロード ---- */
    if (imageFile) {
      const fileName = toSafeKey(imageFile, user!.id);

      const { error: uploadError } = await supabase.storage
        .from("diary-images")
        .upload(fileName, imageFile, {
          contentType: imageFile.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error(uploadError);
        alert("画像のアップロードに失敗しました");
        return;
      }

      const { data: urlData } = supabase.storage
        .from("diary-images")
        .getPublicUrl(fileName);
      image_url = urlData.publicUrl;
    }

    /* ---- posts テーブルへ挿入 ---- */
    await supabase
      .from("posts")
      .insert([{ content, user_id: user!.id, image_url }]);

    setContent("");
    setImageFile(null);
    fetchPosts();
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-xl font-bold border-b pb-2">
        ようこそ、{user?.email}
      </h2>

      {/* 投稿フォーム */}
      <div className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-[120px] rounded-lg border border-gray-300 p-3 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="今日の出来事を書いてみよう"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="block w-full text-sm file:mr-4 file:rounded-md
                     file:border-0 file:bg-indigo-50 file:px-3 file:py-2 
                     file:text-indigo-700 hover:file:bg-indigo-100"
        />

        <button
          onClick={handlePost}
          disabled={!content && !imageFile}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600
                     px-4 py-2 font-medium text-white hover:bg-indigo-700
                     disabled:opacity-40"
        >
          投稿
        </button>
      </div>

      {/* 投稿一覧 */}
      <ul className="space-y-6">
        {posts.map((p) => (
          <li
            key={p.id}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="whitespace-pre-wrap">{p.content}</p>

            {p.image_url && (
              <Image
                src={p.image_url}
                alt="投稿画像"
                width={800}
                height={450}
                priority
                className="mt-4 max-h-80 w-full rounded-lg object-cover"
              />
            )}

            <p className="mt-2 text-xs text-gray-500">
              {new Date(p.created_at).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
