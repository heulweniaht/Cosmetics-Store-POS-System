import { useParams } from "react-router-dom";
import type { Product } from "../../types/product";
import { useEffect, useState } from "react";
import { productApi } from "../../api/productApi";
import "./productDetail.css";

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product>();
  useEffect(() => {
    productApi.getById(id as string).then((res: any) => {
      setProduct(res.result);
    });
  }, [id]);

  const discountedPrice = ((product?.price as number) * (1 - (product?.discount || 0) / 100)).toLocaleString();

  return (
    <>
      {product && (
        <div className="product-detail">
          <div className="product-card">
            <div className="product-image">
              <img src={product.image} alt={product.name} />
            </div>

            <div className="product-info">
              <h1 className="product-name">{product.name}</h1>
              <p className="product-brand">Thương hiệu: {product.brand}</p>
              <p className="product-category">Danh mục: {product.category}</p>

              <div className="product-pricing">
                <span className="price-discounted">{discountedPrice} đ</span>
                <span className="price-original">
                  {product.price.toLocaleString()} đ
                </span>
                <span className="discount-tag">-{product.discount}%</span>
              </div>

              <p className="product-desc">{product.description}</p>

              <div className="product-actions">
                <button className="btn-buy">Mua ngay</button>
                <button className="btn-cart">Thêm vào giỏ hàng</button>
              </div>

              <p className="product-stock">
                Tồn kho: <strong>{product.stock}</strong> sản phẩm
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};