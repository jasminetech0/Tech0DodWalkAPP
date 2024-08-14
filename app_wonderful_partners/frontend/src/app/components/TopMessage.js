import { useState, useEffect } from 'react';

export default function InviteWalk({ petId }) {
  const [invitationMessage, setInvitationMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInvite = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://127.0.0.1:5000/pets/${petId}/invite_walk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('Response status:', response.status);  // 追加

        if (response.ok) {
          const data = await response.json();
          console.log('Response data:', data);  // 追加
          setInvitationMessage(data.message);
        } else {
          console.error('Error fetching invite:', response.statusText);
          setInvitationMessage('お誘いの生成に失敗しました。');
        }
      } catch (error) {
        console.error('Error:', error);
        setInvitationMessage('エラーが発生しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchInvite();
  }, [petId]);

  if (loading) return <p>生成中...</p>;

  return <p>{invitationMessage}</p>;
}
