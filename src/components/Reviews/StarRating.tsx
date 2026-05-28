import React from 'react';
import { Star, StarBorder, StarHalf } from '@mui/icons-material';

interface StarRatingProps {
  /** Rating value (0-5). Halves supported for display. */
  value: number;
  /** Pixel size of each star icon. Default 18. */
  size?: number;
  /** Editable mode — shows hover + click to set new value. */
  editable?: boolean;
  /** Called with the new rating (1-5) when user clicks a star in editable mode. */
  onChange?: (rating: number) => void;
  /** Color override (defaults to gold). */
  color?: string;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  value,
  size = 18,
  editable = false,
  onChange,
  color = '#fbbf24',
  className
}) => {
  const [hover, setHover] = React.useState<number | null>(null);
  const display = hover ?? value;

  const handleClick = (n: number) => {
    if (!editable || !onChange) return;
    onChange(n);
  };

  const stars: React.ReactNode[] = [];
  for (let i = 1; i <= 5; i++) {
    let icon: React.ReactNode;
    if (display >= i) {
      icon = <Star style={{ fontSize: size, color }} />;
    } else if (!editable && display >= i - 0.5) {
      icon = <StarHalf style={{ fontSize: size, color }} />;
    } else {
      icon = <StarBorder style={{ fontSize: size, color: editable ? '#d1d5db' : '#e5e7eb' }} />;
    }
    stars.push(
      <span
        key={i}
        onClick={() => handleClick(i)}
        onMouseEnter={() => editable && setHover(i)}
        onMouseLeave={() => editable && setHover(null)}
        style={{
          cursor: editable ? 'pointer' : 'default',
          display: 'inline-flex',
          padding: editable ? 2 : 0
        }}
        role={editable ? 'button' : undefined}
        aria-label={editable ? `${i} star${i > 1 ? 's' : ''}` : undefined}
      >
        {icon}
      </span>
    );
  }

  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', lineHeight: 1 }}
    >
      {stars}
    </span>
  );
};

export default StarRating;
