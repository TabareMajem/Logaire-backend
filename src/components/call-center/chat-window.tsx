'use client';

import { useCallCenter } from './call-center-context';
import { useState } from 'react';

export function ChatWindow() {
  const { messages, sendMessage, isCallActive } = useCallCenter();
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <div className="flex-1 border rounded-lg p-4 flex flex-col">
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 p-2 rounded ${
              msg.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
            }`}
          >
            <p>{msg.content}</p>
            <small className="text-gray-500">
              {msg.timestamp.toLocaleTimeString()}
            </small>
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 border rounded p-2"
            placeholder="Type a message..."
            disabled={!isCallActive}
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white px-4 py-2 rounded"
            disabled={!isCallActive}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
} 