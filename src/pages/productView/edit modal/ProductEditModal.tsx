import React, { useEffect, useRef, useState } from 'react';
import './ProductEditModal.css';
import { Close, Save, AddAPhoto } from '@mui/icons-material';
import { uploadImagesToSupabase } from '../../../services/service';
import { toast } from 'react-toastify';

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  onUpdate: (updatedData: any) => Promise<void>;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({
  isOpen,
  onClose,
  product,
  onUpdate,
}) => {
  const [name, setName] = useState<string>(product?.name || '');
  const [description, setDescription] = useState<string>(product?.description || '');
  const [price, setPrice] = useState<number>(product?.price || 0);
  const [mrp, setMrp] = useState<number>(product?.mrp || 0);
  const [stock, setStock] = useState<number>(product?.stock || 0);
  const [isAvailable, setIsAvailable] = useState<boolean>(product?.isAvailable ?? true);
  const [genderCategory, setGenderCategory] = useState<string>(product?.genderCategory || 'mens');
  const [productCategory, setProductCategory] = useState<string>(product?.productCategory || 'Extra');
  const [sizes, setSizes] = useState<string[]>(product?.sizes || []);
  const [colors, setColors] = useState<string[]>(product?.colors || []);
  const [sizeInput, setSizeInput] = useState('');
  const [colorInput, setColorInput] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>(product?.images || []);
  const [selectedImage, setSelectedImage] = useState<string | null>(product?.images?.[0] || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen || !product) return;
    setName(product.name || '');
    setDescription(product.description || '');
    setPrice(product.price || 0);
    setMrp(product.mrp || 0);
    setStock(product.stock || 0);
    setIsAvailable(product.isAvailable ?? true);
    setGenderCategory(product.genderCategory || 'mens');
    setProductCategory(product.productCategory || 'Extra');
    setSizes(product.sizes || []);
    setColors(product.colors || []);
    setUploadedImages(product.images || []);
    setSelectedImage(product.images?.[0] || null);
  }, [isOpen, product]);

  if (!isOpen) return null;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
      setUploadedImages((prev) => [...prev, ...newImages]);
      if (!selectedImage && newImages.length > 0) {
        setSelectedImage(newImages[0]);
      }
    }
  };

  const handleImageClick = (image: string) => {
    setSelectedImage(image);
  };

  const handleRemoveImage = (imageToRemove: string) => {
    setUploadedImages((prev) => prev.filter((img) => img !== imageToRemove));
    if (selectedImage === imageToRemove) {
      const remaining = uploadedImages.filter((img) => img !== imageToRemove);
      setSelectedImage(remaining[0] || null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    const updatedData: any = {};

    if (name !== product.name) updatedData.name = name;
    if (description !== product.description) updatedData.description = description;
    if (price !== product.price) updatedData.price = price;
    const newMrp = mrp > 0 ? mrp : null;
    if (newMrp !== (product.mrp ?? null)) updatedData.mrp = newMrp;
    if (stock !== product.stock) updatedData.stock = stock;
    if (isAvailable !== product.isAvailable) updatedData.isAvailable = isAvailable;
    if (genderCategory !== product.genderCategory) updatedData.genderCategory = genderCategory;
    if (productCategory !== product.productCategory) updatedData.productCategory = productCategory;
    if (JSON.stringify(sizes) !== JSON.stringify(product.sizes || [])) updatedData.sizes = sizes;
    if (JSON.stringify(colors) !== JSON.stringify(product.colors || [])) updatedData.colors = colors;

    const existingImages = product.images || [];
    const newImageFiles = uploadedImages.filter((img) => !existingImages.includes(img));
    const retainedImages = uploadedImages.filter((img) => existingImages.includes(img));

    try {
      setIsSubmitting(true);

      if (newImageFiles.length > 0 || retainedImages.length !== existingImages.length) {
        const newUploadedImageUrls =
          newImageFiles.length > 0 ? await uploadImagesToSupabase(newImageFiles) : [];
        updatedData.images = [...retainedImages, ...newUploadedImageUrls];
      }

      if (Object.keys(updatedData).length === 0) {
        toast.info('No changes to save');
        return;
      }

      await onUpdate(updatedData);
      onClose();
    } catch (err) {
      console.error('Failed to update product', err);
      toast.error('Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="product-edit-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div className="product-edit-modal" onClick={(e) => e.stopPropagation()}>
        <header className="product-edit-modal-header">
          <h2>Edit Product</h2>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close edit product modal"
          >
            <Close />
          </button>
        </header>

        <form className="product-edit-form" onSubmit={handleSubmit}>
          <div className="product-edit-grid">
            <div className="product-edit-left">
              <label className="product-edit-label">
                Name
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="product-edit-input"
                  required
                />
              </label>

              <label className="product-edit-label">
                Description
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="product-edit-textarea"
                  rows={4}
                  required
                />
              </label>

              <div className="product-edit-row">
                <label className="product-edit-label">
                  Selling Price (₹)
                  <input
                    type="number"
                    value={price}
                    min={0}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="product-edit-input"
                    required
                  />
                </label>

                <label className="product-edit-label">
                  M.R.P. (₹) — optional
                  <input
                    type="number"
                    value={mrp || ''}
                    min={0}
                    onChange={(e) => setMrp(Number(e.target.value))}
                    className="product-edit-input"
                    placeholder="Leave empty if no discount"
                  />
                </label>

                <label className="product-edit-label">
                  Stock
                  <input
                    type="number"
                    value={stock}
                    min={0}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="product-edit-input"
                    required
                  />
                </label>
              </div>

              <div className="product-edit-row">
                <label className="product-edit-label" style={{flex:'1 1 100%'}}>
                  Available Sizes (optional)
                  <div style={{display:'flex', gap:'0.4rem', marginTop:'0.3rem'}}>
                    <input
                      type="text"
                      value={sizeInput}
                      onChange={(e) => setSizeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const v = sizeInput.trim();
                          if (v && !sizes.includes(v)) setSizes([...sizes, v]);
                          setSizeInput('');
                        }
                      }}
                      placeholder="Press Enter to add (e.g. S, M, L)"
                      className="product-edit-input"
                      style={{flex:1}}
                    />
                  </div>
                  <div style={{display:'flex', flexWrap:'wrap', gap:'0.4rem', marginTop:'0.5rem'}}>
                    {sizes.map(s => (
                      <span key={s} style={{
                        display:'inline-flex', alignItems:'center', gap:'0.3rem',
                        padding:'0.25rem 0.7rem', background:'#f0f1ff', color:'#4338ca',
                        borderRadius:'16px', fontSize:'0.85rem', fontWeight:500
                      }}>
                        {s}
                        <button type="button" onClick={() => setSizes(sizes.filter(x => x !== s))} style={{
                          background:'transparent', border:'none', color:'#6b7280', cursor:'pointer', fontSize:'1rem', padding:0, lineHeight:1
                        }}>×</button>
                      </span>
                    ))}
                  </div>
                </label>
              </div>

              <div className="product-edit-row">
                <label className="product-edit-label" style={{flex:'1 1 100%'}}>
                  Available Colors (optional)
                  <div style={{display:'flex', gap:'0.4rem', marginTop:'0.3rem'}}>
                    <input
                      type="text"
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const v = colorInput.trim();
                          if (v && !colors.includes(v)) setColors([...colors, v]);
                          setColorInput('');
                        }
                      }}
                      placeholder="Press Enter to add (e.g. Red, Blue, Black)"
                      className="product-edit-input"
                      style={{flex:1}}
                    />
                  </div>
                  <div style={{display:'flex', flexWrap:'wrap', gap:'0.4rem', marginTop:'0.5rem'}}>
                    {colors.map(c => (
                      <span key={c} style={{
                        display:'inline-flex', alignItems:'center', gap:'0.3rem',
                        padding:'0.25rem 0.7rem', background:'#fef3c7', color:'#92400e',
                        borderRadius:'16px', fontSize:'0.85rem', fontWeight:500
                      }}>
                        {c}
                        <button type="button" onClick={() => setColors(colors.filter(x => x !== c))} style={{
                          background:'transparent', border:'none', color:'#6b7280', cursor:'pointer', fontSize:'1rem', padding:0, lineHeight:1
                        }}>×</button>
                      </span>
                    ))}
                  </div>
                </label>
              </div>

              <div className="product-edit-row">
                <label className="product-edit-label">
                  Gender
                  <select
                    value={genderCategory}
                    onChange={(e) => setGenderCategory(e.target.value)}
                    className="product-edit-input"
                  >
                    <option value="mens">Mens</option>
                    <option value="womens">Womens</option>
                    <option value="childrens">Childrens</option>
                    <option value="extra">Extra</option>
                  </select>
                </label>

                <label className="product-edit-label">
                  Product Category
                  <input
                    type="text"
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    className="product-edit-input"
                  />
                </label>
              </div>

              <label className="product-edit-checkbox">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                />
                <span>Available for sale</span>
              </label>
            </div>

            <div className="product-edit-right">
              <h3>Images</h3>
              <div className="product-edit-main-image">
                {selectedImage ? (
                  <img src={selectedImage} alt="Selected" />
                ) : (
                  <div className="product-edit-image-placeholder" onClick={triggerFileInput}>
                    <AddAPhoto />
                    <p>Click to upload images</p>
                  </div>
                )}
              </div>

              <div className="product-edit-thumbnails">
                {uploadedImages.map((img) => (
                  <div
                    key={img}
                    className={`product-edit-thumbnail ${img === selectedImage ? 'selected' : ''}`}
                  >
                    <img src={img} alt="Product" onClick={() => handleImageClick(img)} />
                    <button
                      type="button"
                      className="product-edit-remove-image"
                      onClick={() => handleRemoveImage(img)}
                      disabled={isSubmitting}
                    >
                      ✕
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="product-edit-upload-button"
                  onClick={triggerFileInput}
                  disabled={isSubmitting}
                >
                  <AddAPhoto /> Add Images
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
            </div>
          </div>

          <div className="product-edit-modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              <Save /> {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditModal;

