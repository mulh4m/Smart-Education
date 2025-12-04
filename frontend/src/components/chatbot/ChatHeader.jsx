import React from 'react';
import { useTranslation } from 'react-i18next';

const ChatHeader = ({ onClose, onClear }) => {
  const { t } = useTranslation();

  return (
    <div 
      className="chat-header"
      style={{
        backgroundColor: 'var(--primary-color)',
        color: 'var(--text-white)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      <div className="d-flex align-items-center">
        <div 
          className="chat-avatar me-3"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
          }}
        >
          🤖
        </div>
        <div>
          <h5 className="mb-0 fw-bold">{t('chatbot.title')}</h5>
          <small style={{ opacity: 0.8 }}>{t('chatbot.subtitle')}</small>
        </div>
      </div>
      
      <div className="d-flex gap-2">
        <button
          onClick={onClear}
          className="btn btn-sm"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: 'var(--text-white)',
            borderRadius: '8px',
            padding: '6px 10px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
          }}
          title={t('chatbot.clearChat')}
        >
          <i className="bi bi-trash3"></i>
        </button>
        
        <button
          onClick={onClose}
          className="btn btn-sm"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: 'var(--text-white)',
            borderRadius: '8px',
            padding: '6px 10px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
          }}
          title={t('chatbot.close')}
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
