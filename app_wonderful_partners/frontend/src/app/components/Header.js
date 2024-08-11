import Link from 'next/link';
import styles from './Header.module.css'; // もしCSSモジュールを使用している場合

// Headerコンポーネントの定義
const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerText}>
        <div>2024年8月21日（水）</div>
        <div>気温 30℃ 湿度 70%</div>
        <div>軽い風</div>
      </div>
    </header>
  );
}

// Headerコンポーネントをエクスポート
export default Header;

