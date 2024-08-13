import Link from 'next/link';
import styles from './Header.module.css'; // CSSモジュールを使用している場合

// 天気のマークを選択する関数
const getWeatherIcon = (weather) => {
  switch (weather) {
    case '晴れ':
      return '/晴れ.png'; // 晴れの場合のアイコンパス
    case '曇り':
      return '/images/cloudy.png'; // 曇りの場合のアイコンパス(イメージ要) 
    case '雨':
      return '/images/rainy.png'; // 雨の場合のアイコンパス(イメージ要) 
    case '雪':
      return '/images/snowy.png'; // 雪の場合のアイコンパス(イメージ要) 
    default:
      return '/images/default.png'; // デフォルトのアイコン(イメージ要) 
  }
}

// Headerコンポーネントの定義
const Header = () => {
  const weather = '晴れ'; // styles.secondLineの天気情報

  return (
    <header className={styles.header}>
      <img 
        src={getWeatherIcon(weather)} 
        alt={weather} 
        className={styles.weatherIcon} 
      /> {/* 左側に表示する天気のマーク */}
      
      <div className={styles.headerText}>
        <div className={styles.firstLine}>2024年8月21日（水）</div> {/* 1行目 */}
        <div className={styles.secondLine}>{weather}</div> {/* 2行目 */}
        <div className={styles.thirdLine}>気温 30℃</div> {/* 3行目 */}
        <div>湿度 70%</div> {/* 湿度情報 */}
        <div>軽い風</div> {/* 風の情報 */}
      </div>
      
      <img 
        src="/avator-ken.png" 
        alt="Header Image" 
        className={styles.headerImage} 
      /> {/* 右側に表示する画像 */}
    </header>
  );
}

// Headerコンポーネントをエクスポート
export default Header;
