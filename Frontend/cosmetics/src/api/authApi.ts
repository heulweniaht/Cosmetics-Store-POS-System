import axiosClient from './axiosClient';
import { 
  AuthenticationRequest, 
  AuthenticationResponse, 
  UserCreationRequest,
  IntrospectRequest,
  IntrospectResponse,
  RefreshRequest,
  LogoutRequest,
  ApiResponse
} from '../types/auth';

export const authApi = {
  // Đăng nhập
  login: async (data: AuthenticationRequest): Promise<AuthenticationResponse> => {
    const response = await axiosClient.post<ApiResponse<AuthenticationResponse>>('/identity/auth/token', data);
    return response.data.result!;
  },

  // Đăng ký
  register: async (data: UserCreationRequest): Promise<any> => {
    const response = await axiosClient.post<ApiResponse<any>>('/identity/users', data);
    return response.data.result;
  },

  // Kiểm tra token
  introspect: async (data: IntrospectRequest): Promise<IntrospectResponse> => {
    const response = await axiosClient.post<ApiResponse<IntrospectResponse>>('/identity/auth/introspect', data);
    return response.data.result!;
  },

  // Refresh token
  refreshToken: async (data: RefreshRequest): Promise<AuthenticationResponse> => {
    const response = await axiosClient.post<ApiResponse<AuthenticationResponse>>('/identity/auth/refresh', data);
    return response.data.result!;
  },

  // Đăng xuất
  logout: async (data: LogoutRequest): Promise<void> => {
    await axiosClient.post('/identity/auth/logout', data);
  },

  // Lấy thông tin user hiện tại
  getMyInfo: async (): Promise<any> => {
    const response = await axiosClient.get<ApiResponse<any>>('/identity/users/my-info');
    return response.data.result;
  }
};