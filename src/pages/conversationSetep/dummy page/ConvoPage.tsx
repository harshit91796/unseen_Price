
import './ChatList.css'; // Import the CSS file

const ChatList = () => {
  const chats = [
    { name: 'Angel Curtis', message: 'Please help me find a good monitor for t...', time: '02:11', unread: 2, avatar: 'angel.png' },
    { name: 'Zaire Dorwart', message: 'Gacor pisan kang', time: '02:11', unread: 2, avatar: 'zaire.png' },
    { name: 'Kelas Malam', message: 'No one can come today?', time: '02:11', unread: 2, avatar: 'kelas.png' },
    { name: 'Jocelyn Gouse', message: 'You\'re now an admin', time: '02:11', unread: 0, avatar: 'jocelyn.png' },
    { name: 'Jaylon Dias', message: 'Buy back 10k gallons...', time: '02:11', unread: 2, avatar: 'jaylon.png' },
    { name: 'Chance Rhiel Madsen', message: 'Thank you mate!', time: '02:11', unread: 2, avatar: 'chance.png' },
  ];

  return (
    <div className="chat-container">
      {/* Header Section */}
      <div className="chat-header">
        <h1>Mengobrol</h1>
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
        {/* Example user stories */}
        {['Terry', 'Craig', 'Roger', 'Nolan'].map((user, index) => (
          <div className="story" key={index}>
            <img src={`user${index + 1}.png`} alt={user} />
            <p>{user}</p>
          </div>
        ))}
      </div>

      {/* Tabs Section */}
      <div className="tabs">
        <button className="tab active">General</button>
        <button className="tab">Groups</button>
        <button className="tab">Requests</button>
      </div>

      {/* Chat List */}
      <div className="chat-list">
        {chats.map((chat, index) => (
          <div className="chat-item" key={index}>
            <img src={chat.avatar} alt={chat.name} className="chat-avatar" />
            <div className="chat-info">
              <p className="chat-name">{chat.name}</p>
              <p className="chat-message">{chat.message}</p>
            </div>
            <div className="chat-meta">
              <p className="chat-time">{chat.time}</p>
              {chat.unread > 0 && <span className="unread-count">{chat.unread}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <i className="fas fa-home"></i>
        <button className="new-chat-btn">+ New Chat</button>
        <i className="fas fa-bars"></i>
      </div>
    </div>
  );
};

export default ChatList;
