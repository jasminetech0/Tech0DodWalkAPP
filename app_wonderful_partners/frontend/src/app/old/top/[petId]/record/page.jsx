"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PetRecordPage({ params }) {
  const { petId } = params;
  const router = useRouter();

  const [record, setRecord] = useState({
    foodAmount: '',
    foodMemo: '',
    poopAmount: '',
    poopConsistency: '',
    poopMemo: '',
    peeAmount: '',
    peeMemo: '',
    weight: '',
    weightMemo: '',
    otherMemo: '',
    createdAt: '',
  });

  const handleSelection = (field, value) => {
    setRecord((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRecord((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');  // ローカルストレージからJWTトークンを取得
    const response = await fetch(`http://127.0.0.1:5000/pets/${petId}/record`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,  // JWTトークンをAuthorizationヘッダーに含める
        },
        body: JSON.stringify(record),
    });

    if (response.ok) {
        alert('記録が保存されました。');
        router.push(`/top/${petId}`);
    } else {
        const errorData = await response.json();
        console.error('Error:', errorData);
        alert('記録の保存に失敗しました。');
    }
};

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>健康記録</h1>
      
      <section>
        <h2>ごはんの記録</h2>
        {['完食', '少し残した', 'たくさん残した'].map((option) => (
          <button
            type="button"
            key={option}
            onClick={() => handleSelection('foodAmount', option)}
            style={{
              backgroundColor: record.foodAmount === option ? '#0070f3' : '#ccc',
              color: 'white',
              padding: '10px',
              margin: '5px',
              borderRadius: '5px',
            }}
          >
            {option}
          </button>
        ))}
        <textarea
          name="foodMemo"
          value={record.foodMemo}
          onChange={handleInputChange}
          placeholder="ごはんのメモ"
          style={{ padding: '10px', margin: '5px', borderRadius: '5px', width: '100%', height: '50px' }}
        />
      </section>

      <section>
        <h2>うんちの記録</h2>
        <div>
          <h3>量</h3>
          {['多い', '普通', '少ない'].map((option) => (
            <button
              type="button"
              key={option}
              onClick={() => handleSelection('poopAmount', option)}
              style={{
                backgroundColor: record.poopAmount === option ? '#0070f3' : '#ccc',
                color: 'white',
                padding: '10px',
                margin: '5px',
                borderRadius: '5px',
              }}
            >
              {option}
            </button>
          ))}
        </div>
        <div>
          <h3>硬さ</h3>
          {['柔らかい', '普通', 'かたい'].map((option) => (
            <button
              type="button"
              key={option}
              onClick={() => handleSelection('poopConsistency', option)}
              style={{
                backgroundColor: record.poopConsistency === option ? '#0070f3' : '#ccc',
                color: 'white',
                padding: '10px',
                margin: '5px',
                borderRadius: '5px',
              }}
            >
              {option}
            </button>
          ))}
        </div>
        <textarea
          name="poopMemo"
          value={record.poopMemo}
          onChange={handleInputChange}
          placeholder="うんちのメモ"
          style={{ padding: '10px', margin: '5px', borderRadius: '5px', width: '100%', height: '50px' }}
        />
      </section>

      <section>
        <h2>おしっこの記録</h2>
        {['多い', '普通', '少ない'].map((option) => (
          <button
            type="button"
            key={option}
            onClick={() => handleSelection('peeAmount', option)}
            style={{
              backgroundColor: record.peeAmount === option ? '#0070f3' : '#ccc',
              color: 'white',
              padding: '10px',
              margin: '5px',
              borderRadius: '5px',
            }}
          >
            {option}
          </button>
        ))}
        <textarea
          name="peeMemo"
          value={record.peeMemo}
          onChange={handleInputChange}
          placeholder="おしっこのメモ"
          style={{ padding: '10px', margin: '5px', borderRadius: '5px', width: '100%', height: '50px' }}
        />
      </section>

      <section>
        <h2>体重</h2>
        <input
          type="number"
          name="weight"
          value={record.weight}
          onChange={handleInputChange}
          placeholder="体重 (kg)"
          style={{ padding: '10px', margin: '5px', borderRadius: '5px', width: '100%' }}
        />
        <textarea
          name="weightMemo"
          value={record.weightMemo}
          onChange={handleInputChange}
          placeholder="体重のメモ"
          style={{ padding: '10px', margin: '5px', borderRadius: '5px', width: '100%', height: '50px' }}
        />
      </section>

      <section>
        <h2>その他</h2>
        <textarea
          name="otherMemo"
          value={record.otherMemo}
          onChange={handleInputChange}
          placeholder="その他のメモ"
          style={{ padding: '10px', margin: '5px', borderRadius: '5px', width: '100%', height: '100px' }}
        />
      </section>

      <section>
        <h2>発生日時</h2>
        <input
          type="datetime-local"
          name="createdAt"
          value={record.createdAt}
          onChange={handleInputChange}
          style={{ padding: '10px', margin: '5px', borderRadius: '5px', width: '100%' }}
        />
      </section>

      <button type="submit" style={{ backgroundColor: '#0070f3', color: 'white', padding: '10px', margin: '10px 0', borderRadius: '5px', border: 'none', cursor: 'pointer' }}>
        記録を保存
      </button>
    </form>
  );
}
