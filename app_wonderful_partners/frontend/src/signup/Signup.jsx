"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';  // App Routerでは 'next/router' の代わりに 'next/navigation' を使用

export default function Signup() {
  const [user, setUser] = useState({ name: '', email: '', password: '' });
  const [pets, setPets] = useState([{ name: '', type: '', gender: '', birthdate: '', image: null }]);
  const [imagePreviews, setImagePreviews] = useState([null]);
  const [avatars, setAvatars] = useState([]);
  const [error, setError] = useState('');

  const router = useRouter();

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handlePetChange = (index, e) => {
    const { name, value } = e.target;
    const updatedPets = [...pets];
    updatedPets[index][name] = value;
    setPets(updatedPets);
  };

  const handleImageChange = (index, e) => {
    const file = e.target.files[0];
    const updatedPets = [...pets];
    updatedPets[index].image = file;

    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedImagePreviews = [...imagePreviews];
      updatedImagePreviews[index] = reader.result;
      setImagePreviews(updatedImagePreviews);
    };
    if (file) {
      reader.readAsDataURL(file);
    }

    setPets(updatedPets);
  };

  const addPet = () => {
    setPets([...pets, { name: '', type: '', gender: '', birthdate: '', image: null }]);
    setImagePreviews([...imagePreviews, null]);
  };

  const removePet = (index) => {
    const updatedPets = pets.filter((_, i) => i !== index);
    const updatedImagePreviews = imagePreviews.filter((_, i) => i !== index);
    setPets(updatedPets);
    setImagePreviews(updatedImagePreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('user', JSON.stringify(user));
    pets.forEach((pet, index) => {
      formData.append(`pet_${index}_name`, pet.name);
      formData.append(`pet_${index}_type`, pet.type);
      formData.append(`pet_${index}_gender`, pet.gender);
      formData.append(`pet_${index}_birthdate`, pet.birthdate);
      formData.append(`pet_image_${index}`, pet.image);
    });

    // フォームデータをコンソールにログ出力
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]); 
    }

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message);
        return;
      }

      const result = await response.json();
      console.log('登録に成功しました:', result);
      setAvatars(result.avatars);
      setError('');

      // 登録成功後にトップページに遷移
      router.push('/top');
    } catch (error) {
      console.error('登録に失敗しました:', error);
      setError('登録に失敗しました。もう一度お試しください。');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-4">新規登録</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">ユーザー登録</h2>
        <div className="mb-4">
          <label className="block text-gray-700">名前</label>
          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleUserChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">メールアドレス</label>
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleUserChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">パスワード</label>
          <input
            type="password"
            name="password"
            value={user.password}
            onChange={handleUserChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <h2 className="text-2xl font-semibold mb-4">ペット情報</h2>
        {pets.map((pet, index) => (
          <div key={index} className="mb-4 border-b pb-4 mb-6">
            <div className="mb-4">
              <label className="block text-gray-700">ペットの名前</label>
              <input
                type="text"
                name="name"
                value={pet.name}
                onChange={(e) => handlePetChange(index, e)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">ペットの種類</label>
              <input
                type="text"
                name="type"
                value={pet.type}
                onChange={(e) => handlePetChange(index, e)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">ペットの性別</label>
              <select
                name="gender"
                value={pet.gender}
                onChange={(e) => handlePetChange(index, e)}
                className="w-full px-3 py-2 border rounded"
                required
              >
                <option value="">選択してください</option>
                <option value="male">オス</option>
                <option value="female">メス</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">ペットの生年月日</label>
              <input
                type="date"
                name="birthdate"
                value={pet.birthdate}
                onChange={(e) => handlePetChange(index, e)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700">ペットの画像</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(index, e)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            {imagePreviews[index] && (
              <div className="mb-4">
                <img src={imagePreviews[index]} alt="ペットの画像プレビュー" className="w-full h-auto rounded" />
              </div>
            )}
            <button type="button" onClick={() => removePet(index)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
              ペットを削除
            </button>
          </div>
        ))}
        <button type="button" onClick={addPet} className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4">
          ペットを追加
        </button>
        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          登録
        </button>
      </form>
      {avatars.length > 0 && (
        <div className="mt-4">
          <h2 className="text-2xl font-semibold mb-4">アバター犬</h2>
          {avatars.map((avatar, index) => (
            <div key={index} className="mb-4">
              <img src={`http://localhost:5000/uploads/${avatar.split('/').pop()}`} alt={`アバター犬 ${index + 1}`} className="w-full h-auto rounded" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
