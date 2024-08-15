import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

const Footer = () => {
  const [petId, setPetId] = useState(null);

  useEffect(() => {
    // sessionStorageからpetIdを取得
    const storedPetId = sessionStorage.getItem('selectedPetId');
    if (storedPetId) {
      setPetId(storedPetId);
    }
  }, []);

  return (
    <footer>
  <div className={styles['footer-buttons']}>
    <Link href="/top" passHref>
      <button className={styles['footer-button']}>
        <img
          src="/home-button.png"
          alt="ホーム"
          className={styles['footer-icon']}
        />
      </button>
    </Link>
    <Link href={`/${petId}/top/record`} passHref>
      <button className={styles['footer-button']}>日々の<br />記録</button>
    </Link>
    <button className={styles['footer-button']}>記録<br />確認</button>
    <Link href="/top/schedule" passHref>
      <button className={styles['footer-button']}>お世話の<br />予約</button>
    </Link>
  </div>
</footer>
  );
};

export default Footer;
