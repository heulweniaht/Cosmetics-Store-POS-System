import React from 'react';
import type { ProductCardProps } from '../../types/product';

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToOrder }) => {
  const handleClick = () => {
    onAddToOrder(product);
  };

  const discount = product.discount ?? 0; // default = 0
  const hasDiscount = discount > 0;
  const discountedPrice = hasDiscount
      ? product.price - (product.price * discount) / 100
      : product.price;

  return (
      <div
          className="col-xs-12 col-sm-12 col-md-6 col-lg-4 col-xl-3 wrap-product-container"
          onClick={handleClick}
      >
        <div
            className="pos-stock-product"
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: 'auto',
              padding: '8px',
            }}
        >
          <div className="product">
            <div className="img" style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', minHeight: '150px' }}>
              {product.image ? (
                <img
                    src={product.image}
                    alt={product.name}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextSibling) {
                        (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
                      }
                    }}
                    style={{ maxHeight: '150px', objectFit: 'cover', width: '100%' }}
                />
              ) : null}
              <div 
                style={{ 
                  display: product.image ? 'none' : 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                  fontSize: '12px',
                  padding: '20px'
                }}
              >
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="#ccc"/>
                </svg>
                <span style={{ marginTop: '8px' }}>Không có ảnh</span>
              </div>
            </div>

            <div
                className="product-info"
                style={{
                  padding: '4px 0 4px 6px',
                  lineHeight: 1.2,
                }}
            >
              <h4
                  className="title"
                  style={{
                    fontSize: '0.9rem',
                    margin: '0 0 2px 0',
                  }}
              >
                {product.name}
              </h4>

              {hasDiscount ? (
                  <div className="price" style={{ margin: '0 0 2px 0' }}>
                <span
                    style={{
                      textDecoration: 'line-through',
                      marginRight: '6px',
                      color: 'gray',
                      fontSize: '0.7rem',
                      fontWeight: 300,
                    }}
                >
                  {product.price.toLocaleString()}đ
                </span>
                    <span
                        style={{
                          fontWeight: 500,
                          color: '#007bff',
                          fontSize: '0.95rem',
                        }}
                    >
                  {discountedPrice.toLocaleString()}đ
                </span>
                    <span
                        style={{
                          color: 'red',
                          display: 'block',
                          fontSize: '0.8rem',
                          marginTop: '2px',
                        }}
                    >
                  off: {discount}%
                </span>
                  </div>
              ) : (
                  <div className="price" style={{ margin: '0 0 2px 0' }}>
                    {product.price.toLocaleString()}đ
                  </div>
              )}

              <div
                  className="stock"
                  style={{
                    fontSize: '0.8rem',
                    margin: '0',
                  }}
              >
                Tồn: {product.stock}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};
