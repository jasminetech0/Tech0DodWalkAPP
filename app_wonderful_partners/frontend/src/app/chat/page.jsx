"use client";  // クライアントコンポーネントとして指定します


import React, { useState } from 'react';
import styles from './ChatPage.module.css';  // 正しいパスでインポート


const ChatPage = () => {
    const [messages, setMessages] = useState([
        { sender: 'けんちゃん', text: 'こんにちは、マシュー！' },
        { sender: 'マシュー', text: 'こんにちは！お散歩に行くのが楽しみだよ！' },
    ]);

    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = () => {
        if (newMessage.trim() !== '') {
            setMessages([...messages, { sender: 'けんちゃん', text: newMessage }]);
            setNewMessage('');
        }
    };

    return (
        <div className={styles.chatContainer}>
            <div className={styles.messageList}>
                {messages.map((message, index) => (
                    <div key={index} className={styles.message}>
                        <strong>{message.sender}:</strong> {message.text}
                    </div>
                ))}
            </div>
            <div className={styles.inputContainer}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="メッセージを入力"
                    className={styles.inputField}
                />
                <button onClick={handleSendMessage} className={styles.sendButton}>
                    送信
                </button>
            </div>
        </div>
    );
};

export default ChatPage;









