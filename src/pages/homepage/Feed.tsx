

import './feed.css';

import { Link } from 'react-router-dom';
import { images, shopeImages } from '../../Pictures';



const Feed = () => {
  const trendingShops = [
    { 
      name: 'HD Boys', 
      location: 'new market, bhopal', 
      distance: '1.5km', 
      image: shopeImages.shop1
    },
    { 
      name: 'Variety clothes', 
      location: 'roshan pura, bhopal', 
      distance: '2km', 
        image: shopeImages.shop2
    },
    { 
      name: 'Gen-Z', 
      location: 'jawahar chowk, bhopal', 
      distance: '1.8km', 
      image: shopeImages.shop3
    },
    { 
      name: 'Dxter', 
      location: 'new market, bhopal', 
      distance: '1.5km', 
      image: shopeImages.shop4
    },
    { 
      name: 'Quality Wears', 
      location: 'new market, bhopal', 
      distance: '1.5km', 
      image: shopeImages.shop5
    },
    { 
      name: 'HD Boys', 
      location: 'new market, bhopal', 
      distance: '1.5km', 
      image: shopeImages.shop6
    },
    {
      name: 'HD Boys', 
      location: 'new market, bhopal', 
      distance: '1.5km', 
      image: shopeImages.shop7
    },
    {
      name: 'HD Boys', 
      location: 'new market, bhopal', 
      distance: '1.5km', 
      image: shopeImages.shop8
    }
    ,
    {
      name: 'HD Boys', 
      location: 'new market, bhopal', 
      distance: '1.5km', 
      image: shopeImages.shop9
    },
    {
      name: 'HD Boys', 
      location: 'new market, bhopal', 
      distance: '1.5km', 
      image: shopeImages.shop10
    },
    {
      name: 'HD Boys', 
      location: 'new market, bhopal', 
      distance: '1.5km', 
      image: shopeImages.shop11
    },
    {
      name: 'HD Boys', 
      location: 'new market, bhopal', 
      distance: '1.5km', 
      image: shopeImages.shop12
    }
  ];

  return (
    <div className="feed-container">
      {/* Topbar */}
      {/* <Navbar/> */}

      {/* Banner Section */}
      <div className="banner">
        <div className="banner-text">
          <h1>Reflect Who You Are with Our <span>Style</span></h1>
          <p>
            The power of a great outfit is impossible to overstate. At its best, 
            fashion has the ability to transform your mood, identity, and of course, 
            your look. It can be fun, refreshing, and purposeful.
          </p>
          <div className="brands">
            <span>Our Brand Partners: </span>
            <img className='brand-image' src={images.product1} alt="Adidas" />
            <img className='brand-image' src={images.product2} alt="Juicy Couture" />
            <img className='brand-image' src={images.product3} alt="Levi's" />
            <img className='brand-image' src={images.product4} alt="Accessories" />
          </div>
        </div>
        <img 
          src={images.product1} 
          alt="Banner Model" 
          className="banner-image"
        />
      </div>

      {/* Categories Section */}
      <div className="categories">
        {['clothes', 'footwear', 'student', 'Medicals', 'electronics', 'foods'].map((category, index) => (
          <Link style={{textDecoration:'none'}} to={`/search`} key={index}>
            <div className="category">{category}</div>
          </Link>
        ))}
        
      </div>

      {/* Trending Shops Section */}
      <h2>Trending Shops Near <span>You</span></h2>
      <div className="shops-feed">
        {trendingShops.map((shop, index) => (
          <div className='shop-container-feed'>
          <div key={index} className="shop-card-feed">
            <img src={shop.image} alt={shop.name} className="shop-image-feed" />
            <div className="shop-info-feed">
              <h3>{shop.name}</h3>
              <p>{shop.location}</p>
              <span>{shop.distance}</span>
            </div>
          </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feed;
