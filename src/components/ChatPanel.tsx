import React, { useState, useRef, useEffect } from 'react';
import './ChatPanel.css';
import { checkAndUpdateUsageLimit } from '../services/rateLimiter';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPanelProps {
  uid: string;
}

export default function ChatPanel({ uid }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [limitExceeded, setLimitExceeded] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    if (!uid || uid === 'Loading UID..' || uid === 'UNKNOWN') {
      alert('Please wait until your UID/IP is loaded.');
      return;
    }

    setLoading(true);

    try {
      
      const isAllowed = await checkAndUpdateUsageLimit(uid);

      if (!isAllowed) {
        setLimitExceeded(true);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Your daily message limit has been reached! Please try again after 24 hours.',
          },
        ]);
        setLoading(false);
        return;
      }


      const userMessage: Message = { role: 'user', content: input.trim() };
      const updatedHistory = [...messages, userMessage];


      setMessages(updatedHistory);
      setInput('');


      const response = await fetch(import.meta.env.VITE_AI_CHAT_LINK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: uid, 
          messages: updatedHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error status: ${response.status}`);
      }

      const data = await response.json();

  
      const assistantContent =
        data.response || data.message?.content || data.content || JSON.stringify(data);

      const assistantMessage: Message = {
        role: 'assistant',
        content: assistantContent,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '❌Failed to connect to server. Try again later.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <h3>AI Student Assistant</h3>
        <span className="chat-badge">UID: {uid}</span>
      </div>

      {/* Messages List */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-placeholder">
            👋 Welcome! Ask questions about students or the department.
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`chat-bubble-wrapper ${msg.role}`}>
              <div className={`chat-bubble ${msg.role}`}>
                <p>{msg.content}</p>
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="chat-bubble-wrapper assistant">
            <div className="chat-bubble assistant loading">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="chat-input-area">
        <input
          type="text"
          placeholder={limitExceeded ? 'Daily limit reached' : 'Type your question...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading || limitExceeded}
        />
        <button type="submit" disabled={loading || limitExceeded || !input.trim()}>
          {loading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}