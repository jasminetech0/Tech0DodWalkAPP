"use client";
import React from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';



const ShopPage = () => {
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

export default ShopPage;
