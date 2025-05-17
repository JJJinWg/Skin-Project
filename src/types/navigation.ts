// filepath: c:\Users\tmdgu\Desktop\univ\Skin-Project\src\types\navigation.ts

export type RootStackParamList = {
  HomeScreen: undefined;
  ReservationScreen: undefined;
  SkinDiagnosisScreen: undefined;
  FindCosmeticsScreen: undefined;
  ProductReviewScreen: undefined;
  ProductDetailScreen: { id: number };
  ReservationHistoryScreen: undefined;
  RegisterUser: undefined;
  LoginForm: undefined;
  WriteReviewScreen: undefined;
  DoctorDetailScreen: { id: number };
  AppointmentScreen: { 
    doctorId: number;
    doctorName: string;
    specialty: string;
  };
};