// filepath: c:\Users\tmdgu\Desktop\univ\Skin-Project\src\types\navigation.ts

export type RootStackParamList = {
  HomeScreen: undefined;
  ReservationScreen: undefined;
  SkinDiagnosisScreen: undefined;
  SkinAnalysisResultScreen: { imageUri: string }
  FindCosmeticsScreen: undefined;
  ProductReviewScreen: undefined;
  ProductDetailScreen: { id: number };
  ReservationHistoryScreen: undefined;
  RegisterUser: undefined;
  LoginForm: undefined;
  WriteReviewScreen: undefined;
  DoctorDetailScreen: { id: number };
  FindIdScreen: undefined
  FindPasswordScreen: undefined
  PharmacyMapScreen: undefined
  AppointmentScreen: { 
    doctorId: number;
    doctorName: string;
    specialty: string;
  };
  
  
  EditProfileScreen: {
    userInfo: {
      name: string
      email: string
      phone: string
      birthdate: string
      profileImage: any
    }
  };
  EditReviewScreen: {
    review: {
      id: number;
      productId: number;
      productName: string;
      productImage: any;
      rating: number;
      content: string;
      date: string;
      images?: string[];
      likes: number;
      helpful: number;
    }
  };
 

  ProfileScreen: {
    updatedUserInfo?: {
      name: string
      email: string
      phone: string
      birthdate: string
      profileImage: any
    }
  };
  
  DiagnosisHistoryScreen: undefined
  DiagnosisDetailScreen: {diagnosisId: number}

  SkinHistoryScreen: undefined

};
