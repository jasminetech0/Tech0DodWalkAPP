import Link from 'next/link';

import styles from './Footer.module.css';

// Footerコンポーネントの定義
const Footer = () => {
  return (
    <footer>
      <div className={styles['footer-buttons']}>
        <button className={styles['footer-button']}>ホーム</button>
        <button className={styles['footer-button']}>日々の記録</button>
        <button className={styles['footer-button']}>記録確認</button>
        <button className={styles['footer-button']}>お世話の予約</button>
      </div>
    </footer>
  );
};

export default Footer;




