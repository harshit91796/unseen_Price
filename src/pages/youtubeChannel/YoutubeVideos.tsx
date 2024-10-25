import React, { useState, useEffect } from 'react';
import styles from './YoutubeVideos.module.css';
import { videoImages } from '../../Pictures';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  type: 'site' | 'youtube';
}

const YoutubeVideos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    // Fetch videos from your API or use static data
    const fetchedVideos: Video[] = [
      { id: '1', title: 'Site Video 1', thumbnail: videoImages.video4, type: 'site' },
      { id: '2', title: 'YouTube Video 1', thumbnail: videoImages.video1, type: 'youtube' },
      { id: '3', title: 'Site Video 2', thumbnail: videoImages.video2, type: 'site' },
      { id: '4', title: 'YouTube Video 2', thumbnail: videoImages.video3, type: 'youtube' },
      // Add more videos as needed
    ];
    setVideos(fetchedVideos);
  }, []);

  const openVideo = (video: Video) => {
    if (video.type === 'youtube') {
      window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank');
    } else {
      // Handle site video playback
      console.log('Play site video:', video.id);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Our Videos</h1>
      <div className={styles.videoGrid}>
        {videos.map((video) => (
          <div key={video.id} className={styles.videoCard} onClick={() => openVideo(video)}>
            <img src={video.thumbnail}  className={styles.thumbnail} />
            <div className={styles.videoInfo}>
              <h3 className={styles.videoTitle}>{video.title}</h3>
              <span className={styles.videoType}>{video.type === 'youtube' ? 'YouTube' : 'Site'}</span>
            </div>
          </div>
        ))}
      </div>
      <a href="https://www.youtube.com/yourchannel" target="_blank" rel="noopener noreferrer" className={styles.channelLink}>
        Visit our YouTube Channel
      </a>
    </div>
  );
};

export default YoutubeVideos;

