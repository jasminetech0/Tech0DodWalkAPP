import Link from 'next/link';

// MainContentコンポーネントの定義
import React from 'react';
import styles from './MainContent.module.css';

const MainContent = () => {
  return (
    <main className={styles.mainContent}>
      {/* 上部の大きな写真 */}
      <img src="/matthew-image.png" alt="犬の写真" className={styles.dogImage} />

      {/* 横並びの要素（左: 丸い写真, 中央: メッセージボックス, 右: 返信リンク） */}
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
          <div style={{ marginBottom: '5px' }}>けんちゃんへ</div>
          <div>夕方のお散歩が楽しみだよ！</div>
          <div style={{ textAlign: 'right', marginTop: '5px' }}>マシューより</div>
        </div>

        <div className={styles.replyLink}>
            <Link href="/chat">
              <img
                src="/mail-button.png"
                alt="返信"
                className={styles.replyIcon}
              />
            </Link>  {/* Linkコンポーネントでページ遷移を実装 */}   
        </div>
      </div>
    </main>
  );
}

export default MainContent;


