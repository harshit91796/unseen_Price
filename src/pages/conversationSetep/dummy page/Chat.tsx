
import './Chat.css'; // Import CSS for styling

const Chat = () => {
  return (
    <div className="chat-container">
      {/* Header Section */}
      <div className="chat-header">
        <div className="profile-info">
          <img
            src="https://via.placeholder.com/40"
            alt="Charlie Rosser"
            className="profile-pic"
          />
          <div className="user-status">
            <p className="user-name">Charlie Rosser</p>
            <p className="status">Charlie is typing...</p>
          </div>
        </div>
        <div className="header-icons">
          <button className="icon-button">📞</button>
          <button className="icon-button">🎥</button>
        </div>
      </div>

      {/* Chat Body */}
      <div className="chat-body">
        {/* Message Example */}
        <div className="message left">
          <p>Hi! How are you today?</p>
          <span className="timestamp">08.15 AM</span>
        </div>

        <div className="message right audio">
          <div className="audio-message">
            <button className="play-button">▶️</button>
            <div className="waveform">~~~~~~</div>
            <span className="audio-time">00:10</span>
          </div>
          <span className="timestamp">08.20 AM</span>
        </div>

        <div className="message left">
          <p>Did you have a good weekend?</p>
          <span className="timestamp">08.25 AM</span>
        </div>

        <div className="message left">
          <p>Let's go traveling together.</p>
          <span className="timestamp">08.25 AM</span>
        </div>

        <div className="message left image-message">
          <img
            src="https://via.placeholder.com/150"
            alt="Traveling together"
            className="message-image"
          />
          <span className="timestamp">08.26 AM</span>
        </div>
      </div>

      {/* Input Area */}
      <div className="chat-input">
        <button className="attach-button">📎</button>
        <input type="text" placeholder="Send your message..." className="input-box" />
        <button className="send-button">📤</button>
      </div>
    </div>
  );
};

export default Chat;
