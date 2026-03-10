import { useEffect, useState } from "react";
import type { Product } from "../../types/product";
import "./product.scss";
import { productApi } from "../../api/productApi";
import { IoIosSearch } from "react-icons/io";
import { Select } from "antd";
import { NavLink } from "react-router-dom";

export const Products = () => {

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productByCate, setProductByCate] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState<number>(0);
  const [category, setCategory] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [brand, setBrand] = useState<string>("");
  const [totalProduct, setTotalProduct] = useState<number>()

  //Gọi API lấy toàn bộ sản phẩm
  useEffect(() => {
    productApi.getAllProducts().then((res) => {
      setAllProducts(res.result);
    });
  }, []);
  //Gọi API lấy toàn bộ sản phẩm theo danh mục
  useEffect(() => {
    productApi.getProductsByCate(category).then((res) => {
      setProductByCate(res.result);
    });
  }, [category]);

  //gọi API lấy sản phẩm theo trang
  useEffect(() => {
    productApi.getProducts(page, category, name, brand).then((res) => {
      setProducts(res.result);
      setTotalProduct(res.total);
    });
  }, [page, category, name, brand]);

  //tính tổng số trang
  const endPage = Math.ceil((totalProduct as number) / 8);

  //tìm kiếm
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form[0] as HTMLInputElement;

    setName(input.value);
  }

  //lấy brand
  const brands = [
    { value: "", title: "Toàn bộ" }, // option "Tất cả"
    ...Array.from(new Set(productByCate.map(p => p.brand))).map(brand => ({
      value: brand,
      title: brand
    }))
  ];

  const handleChangeBrand = (value: string) => {
    setBrand(value);
  }

  //lấy category
  const categorys = [
    { value: "", title: "Toàn bộ" }, // option "Tất cả"
    ...Array.from(new Set(allProducts.map(p => p.category))).map(category => ({
      value: category,
      title: category
    }))
  ];

  const handleChangeCategory = (value: string) => {
    setCategory(value);
  }
  return (
    <div className="container">
      <div className="container--menu">
        <form onSubmit={handleSubmit}>
          <input placeholder="Nhập tên sản phẩm" />
          <button type="submit" className="button-search"><IoIosSearch /></button>
        </form>

        {/* chọn thương hiệu */}
        <Select
          style={{ width: 160, height: 40, color: "black", marginLeft: 360, marginRight: 20 }}
          placeholder="chọn thương hiệu"
          defaultValue={null}
          onChange={handleChangeBrand}
          options={brands?.map((item) => ({
            value: item.value,
            label: item.title
          }))}
        />

        {/* chọn danh mục */}
        < Select
          style={{ width: 160, height: 40, color: "black" }}
          placeholder="chọn danh mục"
          defaultValue={null}
          onChange={handleChangeCategory}
          options={categorys?.map((item) => ({
            value: item.value,
            label: item.title
          }))}
        />

      </div>
      <div className="title">Danh sách sản phẩm</div>
      <div className="products" >
        {products?.map((items, index) => (
          <NavLink to={items?.id as string} key={index + (items.id as string)}>
            <div className="products--card">
              <div className="products--card__image">
                <img className="img" src={items.image} alt="" />
              </div>
              <div className="products--card__name">{items.name}</div>
              <div className="products--card__price">
                <span className="title">Giá tiền:</span>
                <span className="price">{(items.price * (100 - (items.discount as number)) / 100).toLocaleString()}₫</span>
                <span className="discount">Off {items.discount}%</span>
              </div>
            </div>
          </NavLink>
        ))}
      </div>
      {Array.from({ length: endPage }, (_, i) => (
        <button className="button-page" key={i + 1} onClick={() => setPage(i)}>
          {i + 1}
        </button>
      ))}
    </div>
  );
};