import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid'; 
import { AudioRecorder } from 'react-audio-voice-recorder';
import CustomAudioPlayer from './customAudio/CustomAudioPlayer';

// const addAudioElement = (blob) => {
//   const url = URL.createObjectURL(blob);
//   const audio = document.createElement("audio");
//   audio.src = url;
//   audio.controls = true;
//   document.body.appendChild(audio);
// };

// Initialize Supabase client
const supabaseUrl = 'https://ziruawrcztsttxzvlsuz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppcnVhd3JjenRzdHR4enZsc3V6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY5MDUyNjcsImV4cCI6MjA0MjQ4MTI2N30.YIYgAo7Z8Kb2PuLZtYYQaymdjAySWqdnzraa-0Loj20';
const supabase = createClient(supabaseUrl, supabaseKey);

interface Message {
  _id: string;
  content: string;
  contentType: 'text' | 'image' | 'video' | 'audio';
  mediaUrl?: string;
  sender: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

interface ChatWindowProps {
  chatId: string;
  messages: Message[];
  onSendMessage: (chatId: string, content: string, fileUrl?: string, fileType?: string) => Promise<void>;
  currentChat: any; // Replace 'any' with the correct type
  currentUser: any; // Replace 'any' with the correct type
}

const MessageItem = memo(({ message, isUser }: { message: Message; isUser: boolean }) => (
  <div className={`message ${isUser ? 'user' : 'other'}`}>
    {message.contentType === 'text' && <p>{message.content}</p>}
    {message.contentType === 'image' && <img src={message.mediaUrl} alt="sent image" />}
    {message.contentType === 'video' && <video src={message.mediaUrl as string} controls />}
    {message.contentType === 'audio' && <CustomAudioPlayer audioSrc={message.mediaUrl as string} />}
    <span className="timestamp">{new Date(message.createdAt).toLocaleTimeString()}</span>
  </div>
));

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId, messages, onSendMessage, currentUser }) => { 
  const [newMessage, setNewMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() || file) {
      let fileUrl;
      let fileType;
      if (file) {
        const fileName = `${uuidv4()}-${file.name}`;
         const {data, error} = await supabase.storage.from('ghosts').upload(`public/${fileName}`, file, {
          cacheControl: '3600',
          upsert: true,
        });
        if (error) {
          console.error('Error uploading image:', error);
        } else {
          console.log('Image uploaded to Supabase:', data);
          fileUrl = `${supabaseUrl}/storage/v1/object/public/ghosts/${data.path}`;
          
          fileType = file.type==='image/png'?'image':file.type==='image/jpeg'?'image':file.type==='image/jpg'?'image':file.type === 'audio/mpeg'?'audio': file.type === 'audio/wav'?'audio': 'video';
          console.log('handleSend fnction Image uploaded to Supabase:', 'chatId:', chatId, 'newMessage:', newMessage.trim(), 'fileUrl:', fileUrl, 'fileType:', fileType , typeof fileUrl);
          onSendMessage(chatId, newMessage.trim(), fileUrl, fileType);
          setNewMessage('');
          setFile(null);
        }
      }
      else{
        onSendMessage(chatId,newMessage.trim(), fileUrl, fileType);
        setNewMessage('');
        setFile(null);
      }
     
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    if (file) {
      console.log('File:', file);
    }
  }, [file]);

  const handleAudioUpload = async (audioBlob: Blob) => {
    let fileUrl;
    let fileType;
    const audioFile = new File([audioBlob], 'voice-message.wav', { type: 'audio/wav' });
     const fileName = `${uuidv4()}-${audioFile.name}`;
     const {data, error} = await supabase.storage.from('ghosts').upload(`public/${fileName}`, audioFile, {
      cacheControl: '3600',
      upsert: true,
    });
    if (error) {
      console.error('Error uploading image:', error);
     
    } else {
      fileUrl = `${supabaseUrl}/storage/v1/object/public/ghosts/${data.path}`;
      fileType = 'audio';
      onSendMessage(chatId, '', fileUrl, fileType);
    }
    
  };

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map((message) => (
          <MessageItem 
            key={message._id} 
            message={message} 
            isUser={message.sender._id === currentUser._id} 
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="chat-input">
        <button type="button" className="attach-button" onClick={handleAttachClick}>
          📎
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Message..."
          className="input-box"
        />
        <button type="submit" className="send-button">📤</button>
        <div className='recorder-button'>
          <AudioRecorder 
            onRecordingComplete={handleAudioUpload}
            audioTrackConstraints={{
              noiseSuppression: true,
              echoCancellation: true,
            }} 
          />
        </div>
      </form>
    </div>
  );
};

export default memo(ChatWindow);
