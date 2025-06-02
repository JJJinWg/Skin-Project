// Services 통합 export - 서비스 객체들만 export
export { medicalApi } from './apiClient';
export { authService } from './authService';
export { appointmentService } from './appointmentService';
export { diagnosisService } from './diagnosisService';
export { productService } from './productService';
export { reviewService } from './reviewService';
export { userService } from './userService';
export { imageUploadService } from './imageUploadService';

// 필요한 타입들도 export
export type { Product, Category, ShopInfo, CosmeticRecommendationRequest, CosmeticRecommendation } from './productService';
export type { Doctor, Appointment, ProfileAppointment } from './appointmentService';
export type { DiagnosisRequest, Diagnosis } from './diagnosisService';
export type { Review } from './reviewService';
export type { UserInfo } from './userService';
export type { ImageUploadOptions, ImageUploadResult } from './imageUploadService'; 