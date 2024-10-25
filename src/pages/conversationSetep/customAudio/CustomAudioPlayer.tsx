import { useState, useRef } from 'react';
import './CustomAudioPlayer.css'; // Link to your custom CSS file
import AudioWaveform from '../waveform/AudioWaveform';

const CustomAudioPlayer = ({ audioSrc }: { audioSrc: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);


  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current?.pause();
      } else {
        audioRef.current?.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="audio-player-container">
      
      <div className="audio-waveform-container">
           
           <AudioWaveform audioUrl={audioSrc} togglePlay={togglePlay} />
      </div>
      <audio ref={audioRef} src={audioSrc} />
    </div>
  );
};

export default CustomAudioPlayer;
