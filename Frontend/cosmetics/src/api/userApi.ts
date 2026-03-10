import axiosClient from './axiosClient';

export interface User {
  id: string;
  username: string;
  roles: Role[];
}

export interface Role {
  name: string;
  description: string;
}

export interface UserCreationRequest {
  username: string;
  password: string;
}

export interface UserUpdateRequest {
  password?: string;
  roles: string[];
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

export interface UserListParams {
  page?: number;
  size?: number;
  username?: string;
}

// Lấy danh sách users với phân trang và lọc
export const getUsers = async (params?: UserListParams): Promise<ApiResponse<User[]>> => {
  const response = await axiosClient.get('/identity/users', { params });
  return response.data;
};

// Lấy thông tin user theo ID
export const getUserById = async (userId: string): Promise<ApiResponse<User>> => {
  const response = await axiosClient.get(`/identity/users/${userId}`);
  return response.data;
};

// Tạo user mới
export const createUser = async (userData: UserCreationRequest): Promise<ApiResponse<User>> => {
  const response = await axiosClient.post('/identity/users', userData);
  return response.data;
};

// Cập nhật user
export const updateUser = async (userId: string, userData: UserUpdateRequest): Promise<ApiResponse<User>> => {
  const response = await axiosClient.put(`/identity/users/${userId}`, userData);
  return response.data;
};

// Xóa user
export const deleteUser = async (userId: string): Promise<ApiResponse<string>> => {
  const response = await axiosClient.delete(`/identity/users/${userId}`);
  return response.data;
};

// Lấy thông tin user hiện tại
export const getMyInfo = async (): Promise<ApiResponse<User>> => {
  const response = await axiosClient.get('/identity/users/my-info');
  return response.data;
};

// Thống kê users theo role
// export const getUserStats = async (): Promise<{ total: number; userRole: number; adminRole: number }> => {
//   const response = await getUsers();
//   const users = response.result;
  
//   const stats = {
//     total: users.length,
//     userRole: users.filter(user => user.roles.some(role => role.name === 'USER')).length,
//     adminRole: users.filter(user => user.roles.some(role => role.name === 'ADMIN')).length
//   };
  
//   return stats;
// };

export const getUserStats = async (): Promise<ApiResponse<number>> => {
  try {
    const response = await axiosClient.get('/identity/users/stats/count');
    console.log('✅ User stats response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Error fetching user stats:", error.response?.data || error.message);
    console.error("Status:", error.response?.status);
    // Trả về default response để không crash
    return { code: error.response?.status || 500, message: error.message, result: 0 };
  }
};