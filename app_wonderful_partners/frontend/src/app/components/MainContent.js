import Link from 'next/link';

// MainContentコンポーネントの定義
import React from 'react';
import styles from './MainContent.module.css';

const MainContent = () => {
  return (
    <main className={styles.mainContent}>
      {/* 上部の大きな写真 */}
      <img src="/dog-image.png" alt="犬の写真" className={styles.dogImage} />

      {/* 横並びの要素（左: 丸い写真, 中央: メッセージボックス, 右: 返信リンク） */}
      <div className={styles.horizontalLayout}>
        <div className={styles.profilePicContainer}>
          <img
            src="/dog-profile.png"
            alt="犬のプロフィール"
            className={styles.profilePic}
          />
          <div className={styles.timeStamp}>16:30</div>
        </div>

        <div className={styles.messageBox}>
          <div>けんちゃんへ</div>
          <div>夕方のお散歩楽しみだよ！</div>
          <div style={{ textAlign: 'right', marginTop: '10px' }}>マシューより</div>
        </div>

        <div className={styles.replyLink}>
            <Link href="/chat">
                 返信
            </Link>  {/* Linkコンポーネントでページ遷移を実装 */}   
        </div>
      </div>
    </main>
  );
}

export default MainContent;


