"use client";
import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Header from '../../../components/Header';  // 正しいパスに修正
import Footer from '../../../components/Footer';
import { ja } from 'date-fns/locale';



const MyCalendar = () => {
  const [value, setValue] = useState();  // カレンダーの日付選択
  const [isModalOpen, setIsModalOpen] = useState(false);  // モーダルの開閉管理
  const [selectedTasks, setSelectedTasks] = useState([]);  // 選択された作業の管理 
  const [tasks, setTasks] = useState({});  // 日付ごとのタスクデータを管理

  // テストデータを取得してステートに保存
  useEffect(() => {
    fetch('http://localhost:5000/api/get_all_tasks')  // すべてのタスクを取得するAPIエンドポイント
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log("Fetched tasks:", data);  // デバッグ用
        setTasks(data);
      })
      .catch(error => {
        console.error("There was a problem with the fetch operation:", error);
      });
  }, []);

  




  // 日付クリックでモーダルを開く
  const handleDayClick = (date) => {
    setValue(date);
    setIsModalOpen(true);
  };

  // タスク選択のトグル
  const handleTaskClick = (taskName) => {
    setSelectedTasks(prevTasks =>
      prevTasks.includes(taskName)
        ? prevTasks.filter(t => t !== taskName)  // 選択解除
        : [...prevTasks, taskName]  // 選択
    );
  };

  // タスク登録の処理
  const handleRegister = async () => {
    const payload = {
      user_id: 1,  // 動的に設定できるように修正が必要
      date: value?.toLocaleDateString(),  // 選択された日付
      tasks: selectedTasks  // 選択されたタスクのリスト
    };

    try {
      const response = await fetch('/api/caretasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log("CareTasks registered successfully!");
        setIsModalOpen(false);  // 登録後にモーダルを閉じる
        setSelectedTasks([]);  // タスク選択をリセット
      } else {
        console.error("Failed to register CareTasks.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

   // 日付ごとのタスクをカレンダーに表示
const renderTileContent = ({ date, view }) => {
  if (view === 'month') {
    const dateStr = date.toISOString().split('T')[0]; // 'YYYY-MM-DD' 形式に変換
    const taskForDate = tasks[dateStr]; // 日付に対応するタスクを取得
    if (taskForDate) {
      return (
        <div style={styles.tileContent}>  {/* 修正箇所 */}
          {taskForDate.map((task, index) => (
            <div key={index} style={styles.taskItem}>  {/* 修正箇所 */}
              <strong>{task.task_name}</strong><br/>
              <span>{`User ID: ${task.user_id}`}</span>
            </div>
          ))}
        </div>
      );
    }
  }
  return null;
};



  

  return (
    <div>
      <Header />
      <div style={styles.calendarContainer}>
      <Calendar
        value={value}
        onClickDay={handleDayClick}
        locale={ja}  // ここにlocaleを追加
        tileContent={renderTileContent}  // カレンダーにタスクを表示するコンテンツを追加
        style={{ width: '100%' }}  // カレンダーの幅を100%に設定
        />
      </div>

      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>{value?.toLocaleDateString()}のタスク</h3>
            <button
              style={selectedTasks.includes('朝ご飯') ? styles.selectedButton : styles.button}
              onClick={() => handleTaskClick('朝ご飯')}
            >
              朝ご飯
            </button>
            <button
              style={selectedTasks.includes('夕ご飯') ? styles.selectedButton : styles.button}
              onClick={() => handleTaskClick('夕ご飯')}
            >
              夕ご飯
            </button>
            <button
              style={selectedTasks.includes('朝散歩') ? styles.selectedButton : styles.button}
              onClick={() => handleTaskClick('朝散歩')}
            >
              朝散歩
            </button>
            <button
              style={selectedTasks.includes('夕方散歩') ? styles.selectedButton : styles.button}
              onClick={() => handleTaskClick('夕方散歩')}
            >
              夕方散歩
            </button>
            <button style={styles.registerButton} onClick={() => setIsModalOpen(false)}>
              登録
            </button>
          </div>
        </div>
      )}
       <Footer />
    </div>
  );
};

const styles = {
  calendarContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',  // 上の隙間
    marginBottom: '20px',  // 下の隙間
    width: '100%',  // カレンダーの幅を100%に設定
    maxWidth: '1200px',  // 最大幅を設定して、非常に広がりすぎないようにする
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
  },
  button: {
    display: 'block',
    margin: '10px 0',
    padding: '10px 20px',
    backgroundColor: '#007BFF',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  selectedButton: {
    display: 'block',
    margin: '10px 0',
    padding: '10px 20px',
    backgroundColor: '#28a745', // 選択時の色
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  registerButton: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },

  // 新しく追加するスタイル
  tileContent: {
    display: 'flex',  // フレックスボックスを使用
    flexDirection: 'row',  // 横に並べる
    flexWrap: 'wrap',  // 幅が足りない場合は折り返す
    justifyContent: 'center',  // 中央揃え
    alignItems: 'center',  // 中央揃え
    gap: '5px',  // タスク間の隙間
    padding: '5px',
  },
  taskItem: {
    backgroundColor: '#f0f0f0',  // 背景色
    borderRadius: '5px',  // 角を丸める
    padding: '2px 4px',  // 内側の余白
    minWidth: '60px',  // 各タスクの最小幅
    textAlign: 'center',  // テキストを中央揃え
  },



};

export default MyCalendar;
