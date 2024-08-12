import Link from 'next/link';

import styles from './Footer.module.css';

// Footerコンポーネントの定義
const Footer = () => {
  return (
    <footer>
      <div className={styles['footer-buttons']}>
        <button className={styles['footer-button']}>
          <img
            src="/home-button.png"
            alt="ホーム"
            className={styles['footer-icon']}
          />
        </button>
        <button className={styles['footer-button']}>日々の<br />記録</button>
        <button className={styles['footer-button']}>記録<br />確認</button>
        <button className={styles['footer-button']}>お世話の<br />予約</button>
      </div>
    </footer>
  );
};

export default Footer;




