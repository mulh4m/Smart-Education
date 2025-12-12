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
