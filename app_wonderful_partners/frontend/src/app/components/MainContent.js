import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import styles from './MainContent.module.css';

const MainContent = ({ petId, petName }) => {
  const [invitationMessage, setInvitationMessage] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://127.0.0.1:5000/pets/${petId}/invite_walk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setInvitationMessage(data.message);
          setUsername(data.least_active_username);  // 最も記録が少ないユーザー名をセット
        } else {
          console.error('Error fetching invite:', response.statusText);
          setInvitationMessage('お誘いの生成に失敗しました。');
        }
      } catch (error) {
        console.error('Error:', error);
        setInvitationMessage('エラーが発生しました。');
      }
    };

    fetchInvite();
  }, [petId]);

  return (
    <main className={styles.mainContent}>
      <img src="/matthew-image.png" alt="犬の写真" className={styles.dogImage} />

      <div className={styles.horizontalLayout}>
        <div className={styles.profilePicContainer}>
          <img
            src="/matthew-profile.png"
            alt="犬のプロフィール"
            className={styles.profilePic}
          />
          <div className={styles.timeStamp}>16:30</div>
        </div>

        <div className={styles.messageBox}>
          <div style={{ marginBottom: '5px' }}>{username}さんへ</div>  {/* 最も記録が少ないユーザー名を表示 */}
          <div>{invitationMessage}</div>  {/* ここに散歩のお誘いメッセージが表示される */}
          <div style={{ textAlign: 'right', marginTop: '5px' }}>{petName}より</div>  {/* ペットの名前を表示 */}
        </div>

        <div className={styles.replyLink}>
          <Link href="/chat">
            <img
              src="/mail-button.png"
              alt="返信"
              className={styles.replyIcon}
            />
          </Link>
        </div>
      </div>
    </main>
  );
};

export default MainContent;
