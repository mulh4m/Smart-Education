import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChatModal from './ChatModal';

const ChatButton = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <button
        onClick={openModal}
        className="chat-button"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: 'var(--primary-color)',
          color: 'var(--text-white)',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-lg)',
          transition: 'all 0.3s ease',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'var(--primary-hover)';
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'var(--primary-color)';
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = 'var(--shadow-lg)';
        }}
        title={t('chatbot.openChat')}
      >
        💬
      </button>

      {/* Pulse animation for new messages */}
      <div
        className="chat-pulse"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-color)',
          opacity: 0.3,
          animation: 'pulse 2s infinite',
          zIndex: 999,
          pointerEvents: 'none',
        }}
      />

      <ChatModal isOpen={isModalOpen} onClose={closeModal} />

      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.1;
          }
          100% {
            transform: scale(1);
            opacity: 0.3;
          }
        }

        @media (max-width: 768px) {
          .chat-button {
            bottom: 15px !important;
            right: 15px !important;
            width: 50px !important;
            height: 50px !important;
            fontSize: 20px !important;
          }
          
          .chat-pulse {
            bottom: 15px !important;
            right: 15px !important;
            width: 50px !important;
            height: 50px !important;
          }
        }
      `}</style>
    </>
  );
};

export default ChatButton;
