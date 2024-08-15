"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './pets.module.css'; // CSS Modulesをインポート

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
    sessionStorage.setItem('selectedPetId', petId);
    router.push(`/${petId}/top`);
  };

  return (
    <div className={styles.container}> {/* containerクラスを適用 */}
      <h1 className={styles.title}>ペットを選択してください</h1> {/* titleクラスを適用 */}
      {pets.length > 0 ? (
        <ul className={styles.list}> {/* listクラスを適用 */}
          {pets.map((pet) => (
            <li key={pet.id}>
              <button className={styles.button} onClick={() => handlePetSelection(pet.id)}>
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
