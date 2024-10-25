import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ConversationList from './ConversationList';
import { getChats, getMessages, searchUsers } from '../../Api';
import { sendMessageRequest } from '../../Api';
import { useAppDispatch, useAppSelector } from '../../redux/hooks/hooks';
import './Conversation.css';
import { initSocket, joinChatRoom, leaveRoom, socketSendMessage as  onMessageReceived, disconnectSocket } from '../../socket';
// import { Modal } from '@mui/material';
import Modal from 'react-modal';
// import { SearchResult } from '../path/to/SearchResult';

import { ArrowBackIos } from '@mui/icons-material';
import { clearUser } from '../../redux/user/userSlice';

interface Chat {
  _id: string;
  users: Array<{ _id: string }>;
  isTemporary: boolean;
  isGroupChat: boolean;
  // Add other properties as needed
};



// type Message = {
//   _id: string;
//   content: string;
//   sender: string;
//   timestamp: Date;
// };

const ConversationPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector( (state) => state.user.user);
  const dispatch = useAppDispatch();
  const [chats, setChats] = useState<Chat[]>([]);
  // const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'general' | 'groups' | 'requests'>('general');
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const darkMode = useAppSelector((state) => state.theme.darkMode);

  Modal.setAppElement('#root');

  // const customStyles = {
  //   content: {
  //     top: '50%',
  //     left: '50%',
  //     right: 'auto',
  //     bottom: 'auto',
  //     marginRight: '-50%',
  //     transform: 'translate(-50%, -50%)',
  //   },
  // };

  useEffect(() => {
    if (selectedTab === 'general') {
      setFilteredChats(chats.filter(chat => chat.isTemporary === false && chat.isGroupChat === false));
    } else if (selectedTab === 'groups') {
      setFilteredChats(chats.filter(chat => chat.isTemporary === false && chat.isGroupChat === true));
    } else if (selectedTab === 'requests') {
      setFilteredChats(chats.filter(chat => chat.isTemporary === true ));
    }
  }, [selectedTab, chats]);

  const loadChats = useCallback(async () => {
    console.log('ConversationPage: Loading chats');
    setLoading(true);
    setError(null);
    try {
      const fetchedChats = await getChats();
      console.log('ConversationPage: Fetched chats:', fetchedChats);
      setChats(fetchedChats);
      if (fetchedChats.length > 0) {
        setSelectedChatId(fetchedChats[0]._id);
      }
    } catch (error) {
      console.error('ConversationPage: Error loading chats:', error);
      setError('Failed to load chats. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      console.log('ConversationPage: Initializing socket for user:', user._id);
      // Remove the socket initialization if it's not used
      initSocket(user._id);
      
      onMessageReceived((newMessage: any) => {
        console.log('New message received:', newMessage);
        // setMessages((prevMessages) => [...prevMessages, newMessage]);
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === newMessage.chat._id ? { ...chat, latestMessage: newMessage } : chat
          )
        );
      });

      loadChats();
    }

    return () => {
      console.log('ConversationPage: Cleanup - Disconnecting socket');
      disconnectSocket();
    };
  }, [user, loadChats]);

  useEffect(() => {
    if (selectedChatId) {
      joinChatRoom(selectedChatId);
      loadMessages(selectedChatId);
    }
    return () => {
      if (selectedChatId) {
        leaveRoom(selectedChatId);
      }
    };
  }, [selectedChatId]);

  const loadMessages = async (chatId: string) => {
    setError(null);
    try {
      const fetchedMessages = await getMessages(chatId);
      console.log('Fetched messages:', fetchedMessages);
      // setMessages(fetchedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages. Please try again.');
    }
  };

  

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query) {
      try {
        const results = await searchUsers(query);
        setSearchResults(results);
        
      } catch (error) {
        console.error('Error searching users:', error);
        setError('Failed to search users. Please try again.');
      }
    } else {
      setSearchResults([]);
      setIsModalOpen(false);
      setSearchQuery('');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };


  const handleSelectSearchResult = async (userId: string) => {
    // setError(null);
    try {
      // const chat = await accessChat(userId);
      const existingChat = chats.find(c => c.users?.some((user: { _id: string }) => user._id === userId));
      if (existingChat) {
        setSelectedChatId( existingChat._id);
        navigate(`/conversation/direct/message/${existingChat._id}`);
      } else {
        const chat = await sendMessageRequest(userId,'','');
        console.log("chatRequest",chat);
        setSelectedChatId(chat._id);
        setIsModalOpen(false);
        setSearchResults([]);
        navigate(`/conversation/direct/message/${chat._id}`);
      }
     
     
    } catch (error) {
      console.error('Error accessing chat:', error);
      setError('Failed to access chat. Please try again.');
    }
  };

  

  if (loading) {
    return <div>Loading conversations...</div>;
  }

  if (error) {
    dispatch(clearUser());
    navigate('/login');
  }

  return (
    <div className={`chat-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header Section */}
      

      <div className="chat-header">
      <ArrowBackIos onClick={() => navigate('/')} />
        <h1>Chats</h1>
        <i className="fas fa-search"></i>
      </div>

      {/* Story Section */}
      <div className="story-section">
        <div className="story">
          <div className="add-story">
            <span>+</span>
          </div>
          <p>Add story</p>
        </div>
        {['Terry', 'Craig', 'Roger', 'Nolan'].map((user, index) => (
          <div className="story" key={index}>
            <img src={`user${index + 1}.png`} alt={user} />
            <p>{user}</p>
          </div>
        ))}
      </div>

      {/* Tabs Section */}
      <div className={`tabs ${darkMode ? 'dark-mode' : ''}`}>
         <button className={`tab ${selectedTab === 'general' ? 'active' : ''}`} onClick={() => setSelectedTab('general')}>General</button>
        <button className={`tab ${selectedTab === 'groups' ? 'active' : ''}`} onClick={() => setSelectedTab('groups')}>Groups</button>
        <button className={`tab ${selectedTab === 'requests' ? 'active' : ''}`} onClick={() => setSelectedTab('requests')}>Requests</button>
      </div>

      {/* Chat List */}
      <div className="chat-list">
        <ConversationList
          chats={filteredChats}
          onSelectChat={handleSelectChat}
          selectedChatId={selectedChatId}
          user={user}
        />
      </div>

      {/* Bottom Navigation */}
      <div className={`bottom-nav ${darkMode ? 'dark-mode' : ''}`}>
        <i className="fas fa-home"></i>
        <button className="new-chat-btn" onClick={() => setIsModalOpen(true)}>+ New Chat</button>
        <i className="fas fa-bars"></i>
      </div>

       {/* Search Modal */}
       <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        contentLabel="Search Users"
        className={`search-modal ${darkMode ? 'dark-mode' : ''}`}
        overlayClassName="search-modal-overlay"
        
      >
        <h2>Search Users</h2>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search for users..."
        />
        <ul className="search-results">
          {searchResults.map((result: any) => (
            <li key={result._id} onClick={() => handleSelectSearchResult(result._id)}>
                <div className='search-result-container'>
                <img src={result.profilePic} style={{width: '50px', height: '50px'}} alt={result.username} />
                <span style={{color: darkMode ? 'white' : 'black'}} className={`search-result-username ${darkMode ? 'dark-mode' : ''}`}>{result.name}</span>
                </div>
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
};

export default ConversationPage;
