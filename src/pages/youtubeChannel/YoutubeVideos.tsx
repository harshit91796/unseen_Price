import React, { useState, useEffect } from 'react';
import styles from './YoutubeVideos.module.css';
import { videoImages } from '../../Pictures';
import { FaYoutube, FaFilter, FaSearch } from 'react-icons/fa';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  type: 'site' | 'youtube';
  category: string;
  views: number;
  date: string;
  description: string;
}

const YoutubeVideos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'all',
    'product tutorials',
    'shop updates',
    'sales & offers',
    'customer reviews',
    'trending items'
  ];

  useEffect(() => {
    // Simulated video data - replace with actual API call
    const fetchedVideos: Video[] = [
      {
        id: '1',
        title: 'How to Set Up Your Online Shop',
        thumbnail: videoImages.video4,
        type: 'youtube',
        category: 'shop updates',
        views: 1200,
        date: '2024-01-15',
        description: 'Complete guide for new shop owners'
      },
      {
        id: '2',
        title: 'January Sales Event - Big Discounts!',
        thumbnail: videoImages.video1,
        type: 'youtube',
        category: 'sales & offers',
        views: 850,
        date: '2024-01-10',
        description: 'Special offers and discounts'
      },
      {
        id: '3',
        title: 'Product Showcase: Latest Collection',
        thumbnail: videoImages.video2,
        type: 'youtube',
        category: 'product tutorials',
        views: 2000,
        date: '2024-01-05',
        description: 'New arrivals and features'
      },
      {
        id: '4',
        title: 'Customer Success Stories',
        thumbnail: videoImages.video3,
        type: 'youtube',
        category: 'customer reviews',
        views: 1500,
        date: '2024-01-01',
        description: 'Real customer testimonials'
      },
    ];
    setVideos(fetchedVideos);
  }, []);

  const filteredVideos = videos.filter(video => {
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
      <div className={styles.header}>
        <h1 className={styles.title}>
          <FaYoutube className={styles.youtubeIcon} />
          Shop Video Channel
        </h1>
        <p className={styles.subtitle}>Stay updated with our latest products, offers, and shop news</p>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBar}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.categoryFilter}>
          <FaFilter className={styles.filterIcon} />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.categorySelect}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.videoGrid}>
        {filteredVideos.map((video) => (
          <div key={video.id} className={styles.videoCard} onClick={() => openVideo(video)}>
            <div className={styles.thumbnailContainer}>
              <img src={video.thumbnail} alt={video.title} className={styles.thumbnail} />
              <div className={styles.playButton}>
                <FaYoutube />
              </div>
            </div>
            <div className={styles.videoInfo}>
              <h3 className={styles.videoTitle}>{video.title}</h3>
              <p className={styles.videoDescription}>{video.description}</p>
              <div className={styles.videoMeta}>
                <span className={styles.videoCategory}>{video.category}</span>
                <span className={styles.videoViews}>{video.views} views</span>
                <span className={styles.videoDate}>{new Date(video.date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.uploadSection}>
        <h2>Are you an admin?</h2>
        <p>Upload new videos to keep your customers informed about latest updates</p>
        <button className={styles.uploadButton}>Upload New Video</button>
      </div>
    </div>
  );
};

export default YoutubeVideos;

