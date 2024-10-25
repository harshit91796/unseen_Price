import { useState } from 'react'
import './searchPage.css'
import { Star, StarOutline } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import {images, shopeImages} from '../../Pictures';

export default function SearchPage() {
    const images2 = [images.product1, images.product2, images.product3, images.product4, images.product5, images.product6, images.product7, images.product8]
    const [favorites, setFavorites] = useState<{ [key: number]: boolean }>({});
    const dummySearchResults = [
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
      },
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
      },
      {
        name: 'HD Boys', 
        location: 'new market, bhopal', 
        distance: '1.5km', 
        image: shopeImages.shop1
      },
      {
        name: 'HD Boys', 
        location: 'new market, bhopal', 
        distance: '1.5km', 
        image: shopeImages.shop1
      },
      {
        name: 'HD Boys', 
        location: 'new market, bhopal', 
        distance: '1.5km', 
        image: 'https://via.placeholder.com/150' 
      },
      { 
        name: 'HD Boys', 
        location: 'new market, bhopal', 
        distance: '1.5km', 
        image: 'https://via.placeholder.com/150' 
      },
      {
        name: 'HD Boys', 
        location: 'new market, bhopal', 
        distance: '1.5km', 
        image: 'https://via.placeholder.com/150' 
      },
      {
        name: 'HD Boys', 
        location: 'new market, bhopal', 
        distance: '1.5km', 
        image: 'https://via.placeholder.com/150' 
      },
      {
        name: 'HD Boys', 
        location: 'new market, bhopal', 
        distance: '1.5km', 
        image: 'https://via.placeholder.com/150' 
      },
      {
        name: 'HD Boys', 
        location: 'new market, bhopal', 
        distance: '1.5km', 
        image: 'https://via.placeholder.com/150' 
      },
    ];
    
    interface SearchResult {
        name: string;
        location: string;
        distance: string;
        image: string;
    }

    const [search, setSearch] = useState('')
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])
    const handleSearch = () => {
        
          setSearchResults(dummySearchResults)
        
    }
    const toggleFavorite = (index: number, event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setFavorites(prev => ({ ...prev, [index]: !prev[index] }));
    };

    return (
        <div>
         {searchResults.length === 0 && 
         (
          <>
              <div className="image-container">
              <div className="image-grid">
                {/* Render images twice */}
                {[...images2, ...images2 ].map((image, index) => (
                  <img key={index} src={image} alt={`Image ${index}`} />
                ))}
              </div>
           </div>
           <div className="search-bar">
            <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" placeholder="Search..." />
            <button onClick={handleSearch}>Search</button>
           </div>
           <div className="image-container">
              <div className="image-grid2">
                {/* Render images twice */}
                {[...images2, ...images2  ].map((image, index) => (
                  <img key={index} src={image} alt={`Image ${index}`} />
                ))}
              </div>
           </div>
          </>
         )
         
         }
         {searchResults.length > 0 && (
          <div className='search-page-container'>
             <div className="search-bar">
            <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" placeholder="Search..." />
            <button onClick={handleSearch}>Search</button>
           </div>
          <div className='search-results-container'>
            
          {searchResults.map((shop, index) => (
            <div className='shop-container-search' key={index}>
            <Link to={`/profile`} className="shop-link">
            <div className="shop-card-search">
              <img src={shop.image} alt={shop.name} className="shop-image-search" />
                 <div className="shop-info-search">
                  <h3>{shop.name}</h3>
                  <p>{shop.location}</p>
                  <span>{shop.distance}</span>
                 </div>
            </div>
            </Link>
            <div 
              className="shop-favorite-search" 
              onClick={(e) => toggleFavorite(index, e)}
            >
              {favorites[index] ? 
                <Star style={{ color: 'orange' }} /> : 
                <StarOutline style={{ color: 'black' }} />
              }
            </div>
            </div>
          ))}
          </div>
          </div>
         )}
        </div>
        
    )
}
