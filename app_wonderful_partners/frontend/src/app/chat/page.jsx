"use client";  // クライアントコンポーネントとして指定します

import React, { useState } from 'react';
import styles from './ChatPage.module.css';  // スタイルシートをインポート

const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isBotTurn, setIsBotTurn] = useState(false);

    const sendMessage = async () => {
        if (newMessage.trim() === '') return;  // メッセージが空白の場合は何もしない

        // けんちゃんのメッセージを送信
        const userMessage = { sender: 'けんちゃん', text: newMessage };
        setMessages([...messages, userMessage]);
        setNewMessage('');
        setIsBotTurn(true);

        // マシューの応答を取得（API呼び出し）
        try {
            const botReply = await fetchChatGPTReply(userMessage.text);
            const botMessage = { sender: 'マシュー', text: botReply };
            setMessages(prevMessages => [...prevMessages, botMessage]);
        } catch (error) {
            console.error("Error fetching the bot reply:", error);
        } finally {
            setIsBotTurn(false);  // 次はまたけんちゃんの番
        }
    };

    const fetchChatGPTReply = async (message) => {
      try {
          const response = await fetch('http://localhost:5000/api/chats', {  // Flaskサーバーがローカルで動作している場合のURL
              method: 'POST',
             
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify( message ),
          });
  
          if (!response.ok) {
              throw new Error(`Error: ${response.status} ${response.statusText}`);
          }
  
          const data = await response.json();
          return data.reply;
      } catch (error) {
          console.error("Error fetching the bot reply:", error);
          return "エラーが発生しました。もう一度試してください。";
      }
  };

  return (
    <div>
        <div className={styles.messageList}>
            {messages.map((msg, index) => (
                <div key={index} className={styles.message}>
                    <strong>{msg.sender}:</strong> {msg.text}
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
            <button onClick={sendMessage} disabled={isBotTurn} className={styles.sendButton}>送信</button>
        </div>
    </div>
);

};

    export default ChatPage;
