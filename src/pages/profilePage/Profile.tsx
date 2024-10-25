

import { useState } from 'react';
import './profile.css';
import { Edit } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import {  shopeImages, pantsImages } from '../../Pictures';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('men');

  const products = [
    { id: 1, name: 'Graffiti Boyfriend', price: 24, image: pantsImages.jeans1, category: 'men' },
    { id: 2, name: 'Graffiti Boyfriend', price: 24, image: pantsImages.jeans2, category: 'men' },
    { id: 3, name: 'Graffiti Boyfriend', price: 24, image: pantsImages.jeans3, category: 'men' },
    { id: 4, name: 'Graffiti Boyfriend', price: 24, image: pantsImages.jeans4, category: 'men' },
    { id: 5, name: 'Graffiti Boyfriend', price: 24, image: pantsImages.jeans5, category: 'men' },
    { id: 6, name: 'Graffiti Boyfriend', price: 24, image: pantsImages.jeans6, category: 'men' },
    { id: 7, name: 'Graffiti Boyfriend', price: 24, image: pantsImages.jeans7, category: 'men' },
    { id: 8, name: 'Graffiti Boyfriend', price: 24, image: pantsImages.jeans8, category: 'men' },
    { id: 9, name: 'Graffiti Boyfriend', price: 24, image: pantsImages.jeans9, category: 'men' },
    { id: 10, name: 'Graffiti Boyfriend', price: 24, image: pantsImages.jeans10, category: 'men' },
    { id: 11, name: 'Graffiti Boyfriend', price: 24, image: pantsImages.jeans11, category: 'men' },
    { id: 12, name: 'Graffiti Boyfriend', price: 24, image: pantsImages.jeans12, category: 'men' },
    { id: 13, name: 'Graffiti Boyfriend', price: 24, image: pantsImages.jeans13, category: 'men' },
    { id: 14, name: 'Graffiti Boyfriend', price: 24, image: pantsImages.jeans14, category: 'men' },
    { id: 15, name: 'Graffiti Boyfriend', price: 24, image: pantsImages.jeans15, category: 'men' },
    { id: 16, name: 'Graffiti Boyfriend', price: 24, image: pantsImages.jeans16, category: 'men' },
    { id: 17, name: 'Graffiti Boyfriend', price: 24, image: pantsImages.jeans17, category: 'men' },
    { id: 18, name: 'Graffiti Boyfriend', price: 24, image: pantsImages.jeans18, category: 'men' },
    { id: 19, name: 'Graffiti Boyfriend', price: 24, image: pantsImages.jeans18, category: 'men' },
    { id: 20, name: 'Graffiti Boyfriend', price: 24, image: pantsImages.jeans10, category: 'men' },
    
  ];

  const filteredProducts = products.filter((product) => product.category === activeTab);

  return (
    <div className="shop-details-container">
      {/* Shop Header */}
      <div className="shop-header">
        <img
          src={shopeImages.shop1}
          alt="HD Boys"
          className="shop-image"
        />
        <div className="shop-info">
          <h1>HD Boys</h1>
          <p>Location   : T.T nagar bhopal</p>
          <p>Contact  : +91 8797555854</p>
          <p>Timing  : 12 AM to 10 PM</p>
          <p>Shop Category  : Clothes</p>
          <p>Status  : <span className="status-open">Open</span></p>
        </div>
        <button className='edit-button'><Edit/></button>
      </div>

      {/* Category Tabs */}
      <div className="tabs">
         <div className='tab-buttons'>
         {['men', 'women', 'children', 'extra'].map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.toUpperCase()}
          </button>
        ))}

         </div>

            <div className="filters">
                    <select  className='filter-select-item'>
                        <option value="jeans">Jeans</option>
                        <option value="t-shirt">T-shirt</option>
                        <option value="hoodie">Hoodie</option>
                        <option value="jacket">Jacket</option>
                        <option value="shirt">Shirt</option>
                        <option value="trousers">Trousers</option>
                        <option value="shorts">Shorts</option>
                        <option value="sweater">Sweater</option>
                        <option value="polo-shirt">Polo Shirt</option>
                        <option value="jacket">Jacket</option>
                    </select>
                    <button className="filter-button">Price Filter</button>
                    <Link style={{textDecoration:'none'}} to='/add-Product' className='add-product-button-container'>
                    <button  className='add-product-button'>Add Product</button> 
                    </Link>
              </div>
             
      </div>

      {/* Filters */}
      

      {/* Product Listing */}
      <div className="product-list">
        {filteredProducts.map((product) => (
          <Link style={{textDecoration:'none'}} key={product.id} to={`/productDetails`} className="product-card">
            <img src={product.image} alt={product.name} className="product-image" />
            <p>{product.name}</p>
            <p className="product-price">${product.price}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Profile;
