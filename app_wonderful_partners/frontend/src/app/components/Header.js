import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Header.module.css'; // CSSモジュールを使用している場合

// 天気のマークと和訳を選択する関数
const getWeatherInfo = (weather) => {
  if (!weather) {
    return { icon: '', description: '天気情報を取得中...' }; // 天気情報がまだ取得されていない場合
  }

  switch (weather.main) {
    case 'Clear':
      return { icon: '/01d_ClearSky@2x.png', description: '晴れ', detail: weather.description }; // 晴れ
    case 'Clouds':
      return { icon: '/03d_ScatteredClouds@2x.png', description: 'くもり', detail: weather.description }; // くもり
    case 'Rain':
      return { icon: '/10d_Rain@2x.png', description: '雨', detail: weather.description }; // 雨
    case 'Drizzle':
      return { icon: '/09d_ShoweRain@2x.png', description: '霧雨',detail: weather.description }; // 霧雨
    case 'Thunderstorm':
      return { icon: '/11d_Thunderstorm@2x.png', description: '雷',detail: weather.description }; // 雷
    case 'Snow':
      return { icon: '/13d_Snow@2x.png', description: '雪', detail: weather.description }; // 雪
    case 'Mist':
      return { icon: '/50d_Mist@2x', description: '霞', detail: weather.description }; // 霞
    case 'Fog':
        return { icon: '/50d_Mist@2x', description: '霧', detail: weather.description }; // 霧
    case 'Tornado':
        return { icon: '/50d_Mist@2x', description: '竜巻', detail: weather.description }; // 竜巻
    default:
      return { icon: '/images/default.png', description: '不明', detail: weather.description }; // デフォルト
  }
}

// 現在の日付を取得してフォーマットする関数
const formatDate = () => {
  const date = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
  return date.toLocaleDateString('ja-JP', options);
}

// OpenWeatherMapのAPIを利用して天気を取得する関数
const fetchWeatherData = async (setWeather) => {
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY; // 環境変数からAPIキーを取得
  const city = 'Yokohama'; // 取得する都市を設定
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    const data = await response.json();
    setWeather({
      city: data.name, // 都市名を取得
      main: data.weather[0].main,
      description: data.weather[0].description,
      temp: data.main.temp,
      humidity: data.main.humidity,
      wind: data.wind.speed,
    });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    setWeather(null); // エラーが発生した場合はnullをセット
  }
};

// Headerコンポーネントの定義
const Header = () => {
  const [weather, setWeather] = useState(null); // 初期値をnullに設定
  const [currentDate, setCurrentDate] = useState(formatDate());

  useEffect(() => {
    fetchWeatherData(setWeather);
  }, []);

  const weatherInfo = getWeatherInfo(weather);

  return (
    <header className={styles.header}>
      {weather ? (
        <>
          <div className={styles.weatherContainer}>
            <img 
              src={weatherInfo.icon} 
              alt={weather.main} 
              className={styles.weatherIcon} 
            /> {/* 天気のマーク */}
                        <div className={styles.weatherDescription}>
              {weatherInfo.description} {/* 天気の説明 (例: くもり) */}
            </div>
          </div>
          
          <div className={styles.headerText}>
            <div className={styles.firstLine}>{currentDate}</div> {/* 現在の日付を表示 */}{/* 1行目 */}
            <div className={styles.thirdLine}>気温 {weather.temp}℃</div> {/* 2行目 */}
            <div>湿度 {weather.humidity}%</div> {/* 湿度情報 */}
            <div>軽い風 {weather.wind}m/s</div> {/* 風の情報 */}
          </div>
          
          <img 
            src="/avator-ken.png" 
            alt="Header Image" 
            className={styles.headerImage} 
          /> {/* 右側に表示する画像 */}
        </>
      ) : (
        <p>天気情報を取得中...</p> // ローディング中の表示
      )}
    </header>
  );
}

// Headerコンポーネントをエクスポート
export default Header;
