"use client";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-start mt-0 space-y-4">
      <h1 className="text-4xl font-bold">Welcome to Wonderful partners APP</h1>
      <Link href="/login">
        <button className="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg">ログイン</button>
      </Link>
      <Link href="/signup">
        <button className="btn btn-xs sm:btn-sm md:btn-md lg:btn-lg">新規登録</button>
      </Link>
    </div>
  );
}
