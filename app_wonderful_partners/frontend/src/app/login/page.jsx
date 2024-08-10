"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    const response = await fetch('http://127.0.0.1:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log("Response data:", data);

    if (response.ok) {
      localStorage.setItem('token', data.token);
      sessionStorage.setItem('pets', JSON.stringify(data.pets));
      // トップページにペット情報を渡して遷移
      router.push('/pets');
    } else {
      alert('メールアドレスまたはパスワードが間違っています。');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h1>ログイン</h1>
      <input 
        type="email" 
        placeholder="メールアドレス" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <input 
        type="password" 
        placeholder="パスワード" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      <button type="submit">ログイン</button>
    </form>
  );
}
