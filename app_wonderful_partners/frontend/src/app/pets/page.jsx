"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TopPage() {
  const router = useRouter();
  const [pets, setPets] = useState([]);

  useEffect(() => {
    const petsData = sessionStorage.getItem('pets');
    if (petsData) {
      setPets(JSON.parse(petsData));
    }
  }, []);

  const handlePetSelection = (petId) => {
    sessionStorage.setItem('selectedPetId', petId); // petId を sessionStorage に保存
    router.push(`/${petId}/top`); // ペット専用のページにリダイレクト
  };

  return (
    <div>
      <h1>ペットを選択してください</h1>
      {pets.length > 0 ? (
        <ul>
          {pets.map((pet) => (
            <li key={pet.id}>
              <button onClick={() => handlePetSelection(pet.id)}>
                {pet.name}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>ペットが登録されていません。</p>
      )}
    </div>
  );
}
