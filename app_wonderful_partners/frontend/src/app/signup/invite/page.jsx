"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // ページ遷移用

export default function InviteFamily() {
  const router = useRouter();
  const [familyName, setFamilyName] = useState('');
  const [emails, setEmails] = useState(['']);

  const handleAddEmail = () => {
    setEmails([...emails, '']);
  };

  const handleEmailChange = (index, e) => {
    const newEmails = [...emails];
    newEmails[index] = e.target.value;
    setEmails(newEmails);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    const response = await fetch('http://127.0.0.1:5000/invite_family', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`  // JWTトークンをヘッダーに含める
      },
      body: JSON.stringify({
        family_name: familyName,
        emails: emails,
      }),
    });

    if (response.ok) {
      alert('家族が正常に招待されました！');
      router.push('/top');
    } else {
      alert('家族の招待に失敗しました。');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>家族を招待</h1>
      <input 
        type="text" 
        placeholder="家族名" 
        value={familyName} 
        onChange={(e) => setFamilyName(e.target.value)} 
      />
      {emails.map((email, index) => (
        <div key={index}>
          <input 
            type="email" 
            placeholder="メールアドレス" 
            value={email} 
            onChange={(e) => handleEmailChange(index, e)} 
          />
        </div>
      ))}
      <button type="button" onClick={handleAddEmail}>メールアドレスを追加</button>
      <button type="submit">送信</button>
    </form>
  );
}
