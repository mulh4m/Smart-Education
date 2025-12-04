import React from 'react';
import { useTranslation } from 'react-i18next';

const ChatMessage = ({ message }) => {
  const { t } = useTranslation();
  const isUser = message.sender === 'user';
  const isError = message.isError;

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`d-flex mb-3 ${isUser ? 'justify-content-end' : 'justify-content-start'}`}>
      <div 
        className="message-bubble"
        style={{
          maxWidth: '80%',
          padding: '12px 16px',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          backgroundColor: isUser 
            ? 'var(--primary-color)' 
            : isError 
              ? 'var(--danger-light)' 
              : 'var(--bg-secondary)',
          color: isUser 
            ? 'var(--text-white)' 
            : isError 
              ? 'var(--danger-color)' 
              : 'var(--text-primary)',
          border: isError ? '1px solid var(--danger-color)' : 'none',
          position: 'relative',
          wordWrap: 'break-word',
          lineHeight: '1.4',
        }}
      >
        {!isUser && (
          <div 
            className="message-avatar"
            style={{
              position: 'absolute',
              left: '-50px',
              top: '0',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
            }}
          >
            🤖
          </div>
        )}
        
        <div className="message-content">
          {isError && (
            <div className="d-flex align-items-center mb-2">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <small className="fw-semibold">{t('chatbot.error')}</small>
            </div>
          )}
          
          <div 
            className="message-text"
            style={{
              whiteSpace: 'pre-wrap',
              fontSize: '14px',
            }}
          >
            {message.text}
          </div>
          
          <div 
            className="message-time"
            style={{
              fontSize: '11px',
              opacity: 0.7,
              marginTop: '4px',
              textAlign: isUser ? 'right' : 'left',
            }}
          >
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
