"use client";
import { useRouter } from 'next/navigation';

export default function PetDetailPage({ params }) {
  const { petId } = params;
  const router = useRouter();

  // 各ボタンのクリックハンドラー
  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* ホームボタン */}
      <button
        style={buttonStyle}
        onClick={() => handleNavigation('/top')}
      >
        ホーム
      </button>

      {/* 予約ボタン */}
      <button
        style={buttonStyle}
        onClick={() => handleNavigation(`/top/${petId}/schedule`)}
      >
        予約
      </button>

      {/* 散歩開始ボタン */}
      <button
        style={buttonStyle}
        onClick={() => handleNavigation(`/top/${petId}/start-walk`)}
      >
        散歩開始
      </button>

      {/* 日々の記録ボタン */}
      <button
        style={buttonStyle}
        onClick={() => handleNavigation(`/top/${petId}/record`)}
      >
        日々の記録
      </button>

      {/* 記録確認ボタン */}
      <button
        style={buttonStyle}
        onClick={() => handleNavigation(`/top/${petId}/check-records`)}
      >
        記録確認
      </button>

      {/* メンバー管理ボタン */}
      <button
        style={buttonStyle}
        onClick={() => handleNavigation(`/top/${petId}/manage-members`)}
      >
        メンバー管理
      </button>

      {/* メッセージ詳細ボタン */}
      <button
        style={buttonStyle}
        onClick={() => handleNavigation(`/top/${petId}/message-details`)}
      >
        メッセージ詳細
      </button>
    </div>
  );
}

// ボタンスタイルの共通設定
const buttonStyle = {
  display: 'block',
  margin: '10px 0',
  padding: '10px 20px',
  backgroundColor: '#0070f3',
  color: 'white',
  borderRadius: '5px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '16px',
};