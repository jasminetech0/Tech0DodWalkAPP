"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '../../components/Header';
import MainContent from '../../components/MainContent';
import Footer from '../../components/Footer';

const HomePage = () => {
  const { petId } = useParams();  // petId を URL から取得

  const [petName, setPetName] = useState('');

  useEffect(() => {
    if (petId) {
      const fetchPetData = async () => {
        console.log('Fetching data for petId:', petId);  // デバッグ用のログ
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://127.0.0.1:5000/pets/${petId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          console.log('Response status:', response.status);  // デバッグ用のログ

          if (response.ok) {
            const data = await response.json();
            console.log('Received data:', data);  // デバッグ用のログ
            setPetName(data.petName);  // サーバーから取得したペット名をセット
          } else {
            console.error('Error fetching pet data:', response.statusText);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };

      fetchPetData();
    }
  }, [petId]);

  if (!petId || !petName) {
    return <p>データを読み込み中...</p>;
  }

  return (
    <div>
      <Header />
      <MainContent petId={petId} petName={petName} />
      <Footer />
    </div>
  );
};

export default HomePage;
