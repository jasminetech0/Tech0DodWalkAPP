"use client";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-start mt-5 space-y-4">
      <h1 className="text-1xl font-bold">Welcome to Wonderful partners APP</h1>
      
      {/* 画像を追加 */}
      <img src="/Team.png" alt="Welcome Image" className="w-1/6 h-auto mt-8" />

      <Link href="/login">
        <button className="bg-blue-500 text-white btn btn-xs sm:btn-sm md:btn-md lg:btn-lg mt-1">ログイン</button>
      </Link>
      <Link href="/signup">
        <button className="bg-blue-500 text-white btn btn-xs sm:btn-sm md:btn-md lg:btn-lg">新規登録</button>
      </Link>
    </div>
  );
}
