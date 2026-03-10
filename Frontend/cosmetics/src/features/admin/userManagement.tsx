import React, { useState, useEffect } from 'react';
import { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser
} from '../../api/userApi';
import type { 
  User,
  UserCreationRequest,
  UserUpdateRequest 
} from '../../api/userApi';

import '../../assets/styles/admin.css';
import './userManagement.css';

interface UserStats {
  total: number;
  userRole: number;
  adminRole: number;
}

interface UserFormData {
  username: string;
  password: string;
  roles: string[];
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState<UserStats>({ total: 0, userRole: 0, adminRole: 0 });
  
  // Phân trang và lọc
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [searchUsername, setSearchUsername] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    password: '',
    roles: ['USER']
  });

  // Load users và stats
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers(response.result);
      
      // Tính toán stats từ danh sách users
      const users = response.result;
      const total = users.length;
      const adminRole = users.filter(u => u.roles.some(r => r.name === 'ADMIN')).length;
      const userRole = total - adminRole;
      
      setStats({ total, userRole, adminRole });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Lọc users theo username
  useEffect(() => {
    let filtered = users;
    if (searchUsername.trim()) {
      filtered = users.filter(user => 
        user.username.toLowerCase().includes(searchUsername.toLowerCase())
      );
    }
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, searchUsername]);

  // Phân trang
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Handle form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'roles') {
      setFormData(prev => ({ ...prev, roles: [value] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      roles: ['USER']
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      setLoading(true);
      
      if (modalType === 'create') {
        const createData: UserCreationRequest = {
          username: formData.username,
          password: formData.password
        };
        await createUser(createData);
        setSuccess('Tạo người dùng thành công!');
      } else if (selectedUser) {
        const updateData: UserUpdateRequest = {
          roles: formData.roles
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await updateUser(selectedUser.id, updateData);
        setSuccess('Cập nhật người dùng thành công!');
      }
      
      await loadUsers();
      setShowModal(false);
      resetForm();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      password: '',
      roles: user.roles.map(role => role.name)
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    
    try {
      setLoading(true);
      await deleteUser(userToDelete.id);
      setSuccess('Xóa người dùng thành công!');
      await loadUsers();
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Không thể xóa người dùng');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    resetForm();
    setModalType('create');
    setSelectedUser(null);
    setShowModal(true);
  };

  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  return (
    <div className="user-management">
      {/* Header */}
      <div className="management-header">
        <h1>Quản lý tài khoản</h1>
        <button className="btn btn-primary" onClick={openCreateModal}>
          ➕ Thêm người dùng
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Tổng người dùng</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <h3>{stats.userRole}</h3>
            <p>Người dùng thường</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👑</div>
          <div className="stat-content">
            <h3>{stats.adminRole}</h3>
            <p>Quản trị viên</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo tên đăng nhập..."
          value={searchUsername}
          onChange={(e) => setSearchUsername(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Messages */}
      {error && <div className="alert-error">❌ {error}</div>}
      {success && <div className="alert-success">✅ {success}</div>}

      {/* Users Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading">🔄 Đang tải...</div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên đăng nhập</th>
                <th>Vai trò</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>
                    {user.roles.map(role => (
                      <span key={role.name} className={`role-badge ${role.name.toLowerCase()}`}>
                        {role.name}
                      </span>
                    ))}
                  </td>
                  <td>
                    <button 
                      className="btn-edit" 
                      onClick={() => handleEdit(user)}
                    >
                      ✏️ Sửa
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => openDeleteModal(user)}
                    >
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="btn-page" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            ← Trước
          </button>
          
          <span className="page-info">
            Trang {currentPage} / {totalPages}
          </span>
          
          <button 
            className="btn-page" 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Sau →
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{modalType === 'create' ? 'Thêm người dùng' : 'Sửa người dùng'}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Tên đăng nhập</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  disabled={modalType === 'edit'}
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Mật khẩu</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={modalType === 'create'}
                  className="form-input"
                />
                {modalType === 'edit' && (
                  <p className="warning">Để trống nếu không muốn thay đổi mật khẩu</p>
                )}
              </div>
              
              <div className="form-group">
                <label>Vai trò</label>
                <select
                  name="roles"
                  value={formData.roles[0] || 'USER'}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="USER">Người dùng</option>
                  <option value="ADMIN">Quản trị viên</option>
                </select>
              </div>
              
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Đang xử lý...' : (modalType === 'create' ? 'Tạo' : 'Cập nhật')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="modal-overlay">
          <div className="modal modal-small">
            <div className="modal-header">
              <h2>Xác nhận xóa</h2>
              <button className="btn-close" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>
            
            <div className="modal-content">
              <p>Bạn có chắc chắn muốn xóa người dùng <strong>{userToDelete.username}</strong>?</p>
              <p>Hành động này không thể hoàn tác.</p>
            </div>
            
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>
                Hủy
              </button>
              <button className="btn-delete" onClick={handleDelete} disabled={loading}>
                {loading ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .user-management {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .management-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        
        .management-header h1 {
          color: #1a202c;
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .stat-icon {
          font-size: 2.5rem;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
        }
        
        .stat-content h3 {
          font-size: 2rem;
          font-weight: 700;
          color: #1a202c;
          margin: 0;
        }
        
        .stat-content p {
          color: #64748b;
          margin: 0;
        }
        
        .search-bar {
          margin-bottom: 1.5rem;
        }
        
        .search-input {
          width: 100%;
          max-width: 400px;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.3s;
        }
        
        .search-input:focus {
          border-color: #667eea;
        }
        
        .alert-error {
          background: #fee2e2;
          color: #dc2626;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 1rem;
          border: 1px solid #fca5a5;
        }
        
        .alert-success {
          background: #d1fae5;
          color: #065f46;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 1rem;
          border: 1px solid #6ee7b7;
        }
        
        .table-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          margin-bottom: 2rem;
        }
        
        .users-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .users-table th {
          background: #f8fafc;
          padding: 16px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .users-table td {
          padding: 16px;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .users-table tr:hover {
          background: #f9fafb;
        }
        
        .role-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
          margin-right: 4px;
        }
        
        .role-badge.admin {
          background: #fef3c7;
          color: #d97706;
        }
        
        .role-badge.user {
          background: #dbeafe;
          color: #2563eb;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
        }
        
        .btn-edit {
          background: #3b82f6;
          color: white;
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
          margin-right: 8px;
        }
        
        .btn-delete {
          background: #ef4444;
          color: white;
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
        }
        
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
        }
        
        .btn-page {
          padding: 8px 16px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-page:hover:not(:disabled) {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }
        
        .btn-page:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .page-info {
          font-weight: 500;
          color: #374151;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .modal-small {
          max-width: 400px;
        }
        
        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .modal-header h2 {
          margin: 0;
          color: #1a202c;
        }
        
        .btn-close {
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          color: #6b7280;
        }
        
        .modal-form {
          padding: 1.5rem;
        }
        
        .modal-content {
          padding: 1.5rem;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 1rem;
        }
        
        .form-group label {
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
        }
        
        .form-input, .form-select {
          padding: 12px;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.3s;
        }
        
        .form-input:focus, .form-select:focus {
          border-color: #667eea;
        }
        
        .form-input:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }
        
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }
        
        .btn-cancel {
          padding: 10px 20px;
          background: #f3f4f6;
          color: #374151;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        
        .btn-submit {
          padding: 10px 20px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        
        .warning {
          color: #d97706;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }
        
        .loading {
          text-align: center;
          padding: 2rem;
          font-size: 1.125rem;
          color: #6b7280;
        }
        
        @media (max-width: 768px) {
          .user-management {
            padding: 1rem;
          }
          
          .management-header {
            flex-direction: column;
            gap: 1rem;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .users-table {
            font-size: 0.875rem;
          }
          
          .users-table th,
          .users-table td {
            padding: 8px;
          }
          
          .modal {
            width: 95%;
            margin: 1rem;
          }
        }
      `}</style>
    </div>
  );
};
