"use client";
// src/app/signup/page.jsx
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Next.js 13以降では useRouter の代わりに useNavigation を使用

export default function Register() {
  const router = useRouter();
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    image: null,
  });
  const [pets, setPets] = useState([
    { name: '', breed: '', birthdate: '', gender: '', image: null },
  ]);

  const handleUserChange = (e) => {
    const { name, value, files } = e.target;
    setUserData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handlePetChange = (index, e) => {
    const { name, value, files } = e.target;
    setPets((prev) => {
      const newPets = [...prev];
      newPets[index][name] = files ? files[0] : value;
      return newPets;
    });
  };

  const handleAddPet = () => {
    setPets((prev) => [...prev, { name: '', breed: '', birthdate: '', gender: '', image: null }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('username', userData.username);
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('image', userData.image);
    formData.append('pet_count', pets.length);

    pets.forEach((pet, index) => {
      formData.append(`pets[${index}][name]`, pet.name);
      formData.append(`pets[${index}][breed]`, pet.breed);
      formData.append(`pets[${index}][birthdate]`, pet.birthdate);
      formData.append(`pets[${index}][gender]`, pet.gender);
      formData.append(`pets[${index}][image]`, pet.image);
    });

    const response = await fetch('http://127.0.0.1:5000/register', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);  // JWTトークンを保存
      alert('ユーザー登録が成功しました！');
      router.push('/signup/invite');
    } else {
      alert('ユーザー登録に失敗しました。');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>ユーザー登録</h1>
      <input name="username" placeholder="ユーザー名" onChange={handleUserChange} />
      <input name="email" placeholder="メールアドレス" onChange={handleUserChange} />
      <input name="password" placeholder="パスワード" type="password" onChange={handleUserChange} />
      <input name="image" type="file" onChange={handleUserChange} />

      <h2>ペット登録</h2>
      {pets.map((pet, index) => (
        <div key={index}>
          <input name="name" placeholder="ペットの名前" onChange={(e) => handlePetChange(index, e)} />
          <input name="breed" placeholder="犬種" onChange={(e) => handlePetChange(index, e)} />
          <input name="birthdate" placeholder="誕生日" type="date" onChange={(e) => handlePetChange(index, e)} />
          <input name="gender" placeholder="性別" onChange={(e) => handlePetChange(index, e)} />
          <input name="image" type="file" onChange={(e) => handlePetChange(index, e)} />
        </div>
      ))}
      <button type="button" onClick={handleAddPet}>ペットを追加</button>
      <button type="submit">登録</button>
    </form>
  );
}
