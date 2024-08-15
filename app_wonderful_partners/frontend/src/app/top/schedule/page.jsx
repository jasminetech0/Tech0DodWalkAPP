"use client";
import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Header from '../../components/Header';  // 正しいパスに修正
import Footer from '../../components/Footer';
import { ja } from 'date-fns/locale';



const MyCalendar = () => {
  const [value, setValue] = useState();  // カレンダーの日付選択
  const [isModalOpen, setIsModalOpen] = useState(false);  // モーダルの開閉管理
  const [selectedTasks, setSelectedTasks] = useState([]);  // 選択された作業の管理 

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

  

  return (
    <div>
      <Header />
      <div style={styles.calendarContainer}>
      <Calendar
        value={value}
        onClickDay={handleDayClick}
        locale={ja}  // ここにlocaleを追加
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
};

export default MyCalendar;
