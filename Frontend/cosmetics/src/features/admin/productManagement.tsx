import { useEffect, useState } from 'react';
import '../../assets/styles/admin.css';
import './userManagement.css';
import './productManagement.css';
import type { Product } from '../../types/product';
import { productApi } from '../../api/productApi';
import { MdOutlineModeEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import Swal from "sweetalert2";

export const ProductManagement = () => {
  const [product, setProduct] = useState<Product[]>([]);
  const [page, setPage] = useState<number>(0);
  const brand = ""; const category = ""; const name = "";
  const [totalProduct, setTotalProduct] = useState<number>()
  const [showModal, setShowModal] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState<Product>();

  //gọi API lấy sản phẩm theo trang
  useEffect(() => {
    productApi.getProducts(page, category, name, brand).then((res) => {
      setProduct(res.result);
      setTotalProduct(res.total);
    });
  }, [page, category, name, brand]);

  //tính tổng số trang
  const endPage = Math.ceil((totalProduct as number) / 8);

  //hiện form thêm mới
  const openCreateModal = () => {
    setShowModal(true);
  }

  //thêm mới sp
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = {
      name: formData.get("name") as string,
      image: formData.get("image") as string,
      description: formData.get("note") as string,
      brand: formData.get("brand") as string,
      category: formData.get("category") as string,
      price: Number(formData.get("price")),
      discount: Number(formData.get("discount")),
      stock: Number(formData.get("quantity")),
    };

    try {
      await productApi.create(data);

      Swal.fire({
        icon: "success",
        title: "Thêm sản phẩm mới thành công",
        showConfirmButton: false,
        timer: 1500
      });
      setTimeout(() => {
        setShowModal(false)
      }, 1000);
      form.reset(); // Xóa nội dung form sau khi thêm

    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Thêm sản phẩm thất bại",
        showConfirmButton: false,
        timer: 1500
      });
    }
  }

  //chỉnh sửa sp
  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const id = formData.get("getID") as string;
    const data = {
      name: formData.get("name") as string,
      image: formData.get("image") as string,
      description: formData.get("note") as string,
      brand: formData.get("brand") as string,
      category: formData.get("category") as string,
      price: Number(formData.get("price")),
      discount: Number(formData.get("discount")),
      stock: Number(formData.get("quantity")),
    };

    try {
      await productApi.update(id, data);
      const updateProduct = await productApi.getProducts(page, category, name, brand);
      setProduct(updateProduct.result);

      Swal.fire({
        icon: "success",
        title: "Cập nhật sản phẩm thành công",
        showConfirmButton: false,
        timer: 1500
      });
      setTimeout(() => {
        setShowEdit(false)
      }, 1000);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Cập nhật sản phẩm thất bại",
        showConfirmButton: false,
        timer: 1500
      });
    }
  }
  //hiện form chỉnh sửa
  const handleClickEdit = (items: Product) => {
    setEditData(items);
    setShowEdit(true);
  }
  //xóa sp
  const handleDelete = (id: string) => {

    Swal.fire({
      title: 'Bạn có chắc muốn xóa sản phẩm này?',
      text: 'Hành động này không thể hoàn tác!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Có, xóa!',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {

      if (result.isConfirmed) {
        await productApi.delete(id); // Gọi API xóa
        Swal.fire({
          title: 'Xóa Sản Phẩm Thành Công!',
          icon: 'success',
          confirmButtonText: 'OK'
        })
        const updateProduct = await productApi.getProducts(page, category, name, brand);
        setProduct(updateProduct.result);
      }
    });
  }
  return (
    <>
      <div className="user-management">
        {/* Header */}
        <div className="management-header">
          <h1>Quản lý sản phẩm</h1>
          <button className="btn btn-primary" onClick={openCreateModal} >
            ➕ Thêm mới
          </button>
        </div>
        {/* Product Table */}
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th style={{ textAlign: "center" }}>ID</th>
                <th style={{ textAlign: "center" }}>Tên sản phẩm</th>
                <th style={{ textAlign: "center" }}>Hãng</th>
                <th style={{ textAlign: "center" }}>Số lượng</th>
                <th style={{ textAlign: "center" }}>Giá</th>
                <th style={{ textAlign: "center" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {product.map((items) => (
                <tr key={items.id}>
                  <td style={{ width: 350 }}>{items.id}</td>
                  <td>{items.name}</td>
                  <td>{items.brand}</td>
                  <td>{items.stock}</td>
                  <td>{items.price.toLocaleString()}đ</td>
                  <td>
                    <div style={{ display: "flex" }}>
                      <button
                        style={{ padding: "6px 8px", outline: "none" }}
                        className="btn-edit"
                        onClick={() => handleClickEdit(items)}

                      >
                        <MdOutlineModeEdit />
                      </button>
                      <button
                        style={{ padding: "6px 8px", outline: "none" }}
                        className="btn-delete"
                        onClick={() => handleDelete(items.id as string)}
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={6}>
                  {Array.from({ length: endPage }, (_, i) => (
                    <button className="button-page-admin" key={i + 1} onClick={() => setPage(i)}>
                      {i + 1}
                    </button>
                  ))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {showModal && (
        <div>
          <div className="overlay" onClick={() => setShowModal(false)}></div>
          <div className="modal-product">
            <div className="header-modal-product">
              <span style={{ fontSize: "20px", fontWeight: 600 }}>Thêm mới sản phẩm</span>
              <button style={{ outline: "none", background: "#C0392B", padding: "0.4rem 0.9rem" }} onClick={() => setShowModal(false)}>x</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className='type-product-one'>
                <label htmlFor='1'>Tên sản phẩm:</label>
                <input name='name' id='1' type='text' placeholder='Nhập tên sản phẩm'></input>
              </div>
              <div className='type-product-one'>
                <label style={{ marginRight: "39px" }} htmlFor='2'>Hình ảnh:</label>
                <input name='image' id='2' type='text' placeholder='Nhập link ảnh'></input>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div className='type-product-two'>
                  <label htmlFor='3'>Danh mục:</label>
                  <input name='category' id='3' type='text' placeholder='Nhập danh mục'></input>
                </div>
                <div className='type-product-two'>
                  <label htmlFor='4'>Thương hiệu:</label>
                  <input name='brand' id='4' type='text' placeholder='Nhập thương hiệu'></input>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div className='type-product-three'>
                  <label htmlFor='5'>Số lượng:</label>
                  <input name='quantity' id='5' type='text' placeholder='Nhập số lượng'></input>
                </div>
                <div className='type-product-three'>
                  <label htmlFor='6'>Giảm giá:</label>
                  <input name='discount' id='6' type='text' placeholder='Nhập giảm giá'></input>
                </div>
                <div className='type-product-three'>
                  <label htmlFor='7'>Giá tiền:</label>
                  <input name='price' id='7' type='text' placeholder='Nhập giá tiền'></input>
                </div>
              </div>
              <div className='textarea-product'>
                <label htmlFor='8'>Ghi chú</label>
                <textarea name='note' rows={5} id='8' placeholder='Nhập ghi chú'></textarea>
              </div>
              <button type='submit'>Tạo mới</button>
            </form>
          </div>
        </div>
      )}
      {showEdit && (
        <div>
          <div className="overlay" onClick={() => setShowEdit(false)}></div>
          <div className="modal-product">
            <div className="header-modal-product">
              <span style={{ fontSize: "20px", fontWeight: 600 }}>Thêm mới sản phẩm</span>
              <button style={{ outline: "none", background: "#C0392B", padding: "0.4rem 0.9rem" }} onClick={() => setShowEdit(false)}>x</button>
            </div>
            <form onSubmit={handleEdit}>
              <input name='getID' type='text' defaultValue={editData?.id} style={{ display: "none" }} />
              <div className='type-product-one'>
                <label htmlFor='1'>Tên sản phẩm:</label>
                <input name='name' id='1' type='text' placeholder='Nhập tên sản phẩm' defaultValue={editData?.name} />
              </div>
              <div className='type-product-one'>
                <label style={{ marginRight: "39px" }} htmlFor='2'>Hình ảnh:</label>
                <input name='image' id='2' type='text' placeholder='Nhập link ảnh' defaultValue={editData?.image} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div className='type-product-two'>
                  <label htmlFor='3'>Danh mục:</label>
                  <input name='category' id='3' type='text' placeholder='Nhập danh mục' defaultValue={editData?.category} />
                </div>
                <div className='type-product-two'>
                  <label htmlFor='4'>Thương hiệu:</label>
                  <input name='brand' id='4' type='text' placeholder='Nhập thương hiệu' defaultValue={editData?.brand} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div className='type-product-three'>
                  <label htmlFor='5'>Số lượng:</label>
                  <input name='quantity' id='5' type='text' placeholder='Nhập số lượng' defaultValue={editData?.stock} />
                </div>
                <div className='type-product-three'>
                  <label htmlFor='6'>Giảm giá:</label>
                  <input name='discount' id='6' type='text' placeholder='Nhập giảm giá' defaultValue={editData?.discount} />
                </div>
                <div className='type-product-three'>
                  <label htmlFor='7'>Giá tiền:</label>
                  <input name='price' id='7' type='text' placeholder='Nhập giá tiền' defaultValue={editData?.price} />
                </div>
              </div>
              <div className='textarea-product'>
                <label htmlFor='8'>Ghi chú</label>
                <textarea name='note' rows={5} id='8' placeholder='Nhập ghi chú' defaultValue={editData?.description} />
              </div>
              <button type='submit'>Cập nhật</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};