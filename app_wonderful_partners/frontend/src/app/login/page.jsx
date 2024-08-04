"use client";  // これをファイルの最初に追加します

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';  // next/router の代わりに next/navigation を使用します

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (event) => {
    event.preventDefault();
    // (未作成) ログインの処理をここに追加します 
    // （未作成）成功したら top ページに遷移します
    router.push('/top');
  };

  return (
    <div>
      <h1>ログインページ</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="email">メールアドレス:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">パスワード:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">ログイン</button>
      </form>
    </div>
  );
}
