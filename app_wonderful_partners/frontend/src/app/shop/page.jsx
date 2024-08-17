"use client";
import React from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

const HomePage = () => {
  return (
    <div>
      <Header />

      {/* MainContentの代わりにPNG画像を表示 */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '20px 0' }}>
        <img src="/wear.png" alt="Your Image" style={{ maxWidth: '100%', height: 'auto' }} />
      </div>
      
      <Footer />
      {/* 他のコンテンツやコンポーネントをここに追加できます */}
    </div>
  );
};

export default HomePage;
