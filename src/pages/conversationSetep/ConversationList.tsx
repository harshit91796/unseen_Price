import React from 'react';
import { Link } from 'react-router-dom';

// interface Chat {
//   _id: string;
//   chatName: string;
//   isGroupChat: boolean;
//   groupProfilePic?: string; // Add this line
//   users: Array<{ _id: string; name: string , profilePic?: string }>;
//   latestMessage?: {
//     content: string;
//     sender: { name: string };
//   };
// }




interface ConversationListProps {
  chats: any;
  onSelectChat: (chatId: string) => void;
  selectedChatId: string | null;
  user: any
}

const ConversationList: React.FC<ConversationListProps> = ({ chats , selectedChatId, user }) => {
  if (!chats || chats.length === 0) {
    return <div className="no-conversations">No conversations yet.</div>;
  }

  return (
    <>
      {chats.map((chat: any) => (
        <Link
          key={chat._id}
          to={`/conversation/direct/message/${chat._id}`}
          className={`chat-item ${chat._id === selectedChatId ? 'selected' : ''}`}
        >
          <img 
            src={chat.isGroupChat 
              ? (chat.groupProfilePic || chat.users.find((u: any) => u._id === user._id)?.profilePic ) 
              : chat.users.find((u: any) => u._id !== user._id)?.profilePic 
            } 
            alt={chat.chatName} 
            className="chat-avatar" 
          />
          <div className="chat-info">
            <p className="chat-name">{chat.isGroupChat ? chat.chatName : chat.users.find((u: any)  => u._id !== user._id)?.name}</p>
            <p className="chat-message">{chat.latestMessage ? chat.latestMessage.content : 'No messages yet'}</p>
          </div>
          <div className="chat-meta">
            <p className="chat-time">
              {chat.latestMessage && 'createdAt' in chat.latestMessage
                ? new Date(chat.latestMessage.createdAt as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : ''}
            </p>
            {/* Add unread count if available */}
          </div>
        </Link>
      ))}
    </>
  );
};

export default ConversationList;
