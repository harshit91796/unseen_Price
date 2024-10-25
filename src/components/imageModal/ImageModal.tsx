import React, { useState, useRef, useEffect } from 'react';
import styles from './ImageModal.module.css';

interface ImageModalProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    resetZoomAndPosition();
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    resetZoomAndPosition();
  };

  const handleZoom = (event: React.WheelEvent) => {
    event.preventDefault();
    const newScale = scale + event.deltaY * -0.01;
    setScale(Math.min(Math.max(1, newScale), 3));
  };

  const resetZoomAndPosition = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: event.clientX - position.x, y: event.clientY - position.y });
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      const newX = event.clientX - dragStart.x;
      const newY = event.clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <div className={styles.mainImageContainer}>
          <div 
            className={styles.imageContainer} 
            onWheel={handleZoom}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <img 
              ref={imageRef}
              src={images[currentIndex]} 
              alt={`Product ${currentIndex + 1}`} 
              style={{ 
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                cursor: scale > 1 ? 'grab' : 'default'
              }}
            />
          </div>
          <button className={`${styles.navButton} ${styles.prevButton}`} onClick={prevImage}>‹</button>
          <button className={`${styles.navButton} ${styles.nextButton}`} onClick={nextImage}>›</button>
        </div>
        <div className={styles.thumbnailContainer}>
          <div className={styles.thumbnailScroll}>
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className={`${styles.thumbnail} ${index === currentIndex ? styles.activeThumbnail : ''}`}
                onClick={() => {
                  setCurrentIndex(index);
                  resetZoomAndPosition();
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
