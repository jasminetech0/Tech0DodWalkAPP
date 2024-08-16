import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import styles from './MainContent.module.css';
import dynamic from 'next/dynamic';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';

const MainContent = ({ petId, petName }) => {
  const [invitationMessage, setInvitationMessage] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchInvite = async () => {
      const today = new Date().toISOString().split('T')[0]; // 今日の日付 (yyyy-mm-dd 形式)
      const lastUpdated = localStorage.getItem(`lastUpdated-${petId}`);
      const savedMessage = localStorage.getItem(`inviteMessage-${petId}`);
      const savedUsername = localStorage.getItem(`leastActiveUsername-${petId}`);

      // 最後に更新された日付と今日の日付が同じで、保存されたメッセージがあればそれを表示
      if (lastUpdated === today && savedMessage && savedUsername) {
        setInvitationMessage(savedMessage);
        setUsername(savedUsername);
        return;
      }

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
          setUsername(data.least_active_username);
          // ローカルストレージにメッセージ、ユーザー名、そして更新日を保存
          localStorage.setItem(`inviteMessage-${petId}`, data.message);
          localStorage.setItem(`leastActiveUsername-${petId}`, data.least_active_username);
          localStorage.setItem(`lastUpdated-${petId}`, today);
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

  // VRMモデルのレンダリングを行うコンポーネントを非SSRで読み込む
  const VRMModel = dynamic(() => import('../components/DogAvatar'), { ssr: false });

  return (
    <main className={styles.mainContent}>
      <Canvas style={{ width: '100%', height: '40vh', backgroundColor: 'gray' }}>
        <ambientLight intensity={1} />
        <directionalLight position={[0, 10, 10]} intensity={1} />
        <OrbitControls />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="green" />
        </mesh>
        <Sky 
          distance={450000} 
          sunPosition={[1, 2, 3]} 
          inclination={0.6} 
          azimuth={0.25}
        />
        <VRMModel message={invitationMessage} /> {/* メッセージを渡す */}
      </Canvas>

      <div className={styles.messageAndProfileContainer}>
        <div className={styles.horizontalLayout}>
          <div className={styles.profilePicContainer}>
            <img
              src="/matthew-profile.png"
              alt="犬のプロフィール"
              className={styles.profilePic}
            />
          </div>

          <div className={styles.messageBoxContainer}>
            <div className={styles.messageBox}>
              <div style={{ marginBottom: '5px' }}>{username}さんへ</div>  {/* 最も記録が少ないユーザー名を表示 */}
              <div>{invitationMessage}</div>  {/* ここに散歩のお誘いメッセージが表示される */}
              <div style={{ textAlign: 'right', marginTop: '5px' }}>{petName}より</div>  {/* ペットの名前を表示 */}
            </div>
            <Link href="/chat">
              <img
                src="/mail-button.png"
                alt="返信"
                className={styles.replyIcon}
              />
            </Link>
          </div>
        </div>
      </div>

      {/* 追加: 本日のマシュータイトル */}
      <div className={styles.dailyTitle}>
        本日のマシュー
      </div>

      {/* 追加: 散歩とごはんの情報を2列で表示 */}
      <div className={styles.dailyActivities}>
        <div className={`${styles.activityBox} ${styles.walk}`}>
          <div className={styles.activityTitle}>散歩</div>
          <div className={styles.activityDetails}>
            05:00 - 05:30 （パパ）<br />
            18:00 - 18:30 （パパ・けんちゃん）
          </div>
        </div>

        <div className={`${styles.activityBox} ${styles.meal}`}>
          <div className={styles.activityTitle}>ごはん</div>
          <div className={styles.activityDetails}>
            06:00 （ママ）<br />
            18:00 （ママ）
          </div>
        </div>
      </div>
    </main>
  );
};

export default MainContent;
