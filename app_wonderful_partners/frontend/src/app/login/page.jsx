"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Login.module.css';  // CSSをインポート

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        sessionStorage.setItem('pets', JSON.stringify(data.pets));
        // トップページにペット情報を渡して遷移
        router.push('/pets');
      } else {
        setErrorMessage('メールアドレスまたはパスワードが間違っています。');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('ログインに失敗しました。サーバーに問題があるかもしれません。');
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleLogin}>
        <h1 className={styles.title}>ログイン</h1>
        <input 
          type="email" 
          placeholder="メールアドレス" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className={styles.inputField}  // クラスを適用
        />
        <input 
          type="password" 
          placeholder="パスワード" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          className={styles.inputField}  // クラスを適用
        />
        <button type="submit" className={styles.button}>ログイン</button>
        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
      </form>
    </div>
  );
}
