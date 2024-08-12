"use client";  // クライアントコンポーネントとして指定します

import React from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import MainContent from '../components/MainContent'
import Footer from '../components/Footer';


const HomePage = () => {
  return (
    <div>
      <Header />
      <MainContent />
      <Footer />
      {/* 他のコンテンツやコンポーネントをここに追加できます */}
    </div>
  );
};

export default HomePage;






