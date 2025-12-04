import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const ChatInput = ({ onSendMessage, disabled }) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  return (
    <div 
      className="chat-input"
      style={{
        padding: '16px 20px',
        backgroundColor: 'var(--bg-card)',
        borderTop: '1px solid var(--border-color)',
      }}
    >
      <form onSubmit={handleSubmit} className="d-flex align-items-end gap-2">
        <div 
          className="input-container"
          style={{
            flex: 1,
            position: 'relative',
          }}
        >
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder={t('chatbot.placeholder')}
            disabled={disabled}
            style={{
              width: '100%',
              minHeight: '40px',
              maxHeight: '120px',
              padding: '10px 12px',
              border: '1px solid var(--input-border)',
              borderRadius: '20px',
              backgroundColor: 'var(--input-bg)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              resize: 'none',
              outline: 'none',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--input-focus)';
              e.target.style.boxShadow = '0 0 0 2px rgba(124, 142, 240, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--input-border)';
              e.target.style.boxShadow = 'none';
            }}
          />
          
          {message.trim() && (
            <div 
              className="character-count"
              style={{
                position: 'absolute',
                bottom: '-20px',
                right: '0',
                fontSize: '11px',
                color: 'var(--text-muted)',
              }}
            >
              {message.length}/1000
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: message.trim() && !disabled 
              ? 'var(--primary-color)' 
              : 'var(--text-muted)',
            color: 'var(--text-white)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            cursor: message.trim() && !disabled ? 'pointer' : 'not-allowed',
          }}
          onMouseEnter={(e) => {
            if (message.trim() && !disabled) {
              e.target.style.backgroundColor = 'var(--primary-hover)';
              e.target.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (message.trim() && !disabled) {
              e.target.style.backgroundColor = 'var(--primary-color)';
              e.target.style.transform = 'scale(1)';
            }
          }}
          title={t('chatbot.sendMessage')}
        >
          {disabled ? (
            <div 
              className="spinner-border spinner-border-sm"
              style={{ width: '16px', height: '16px' }}
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : (
            <i className="bi bi-send-fill" style={{ fontSize: '14px' }}></i>
          )}
        </button>
      </form>
      
      <div 
        className="input-hint"
        style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          marginTop: '8px',
          textAlign: 'center',
        }}
      >
        {t('chatbot.inputHint')}
      </div>
    </div>
  );
};

export default ChatInput;
