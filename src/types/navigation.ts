export type RootStackParamList = {
  Login: undefined
  Register: undefined
  Home: undefined
  HomeScreen: undefined
  ReservationScreen: undefined
  SkinDiagnosisScreen: undefined
  SkinAnalysisResultScreen: { imageUri: string }
  FindCosmeticsScreen: undefined
  ProductReviewScreen: undefined
  ProductDetailScreen: { id: number }
  ReservationHistoryScreen: undefined
  RegisterUser: undefined
  LoginForm: undefined
  WriteReviewScreen: undefined
  DoctorDetailScreen: { doctorId: number; doctorName: string; doctorSpecialty: string }
  FindIdScreen: undefined
  FindPasswordScreen: undefined
  PharmacyMapScreen: undefined
  AppointmentScreen: {
    doctorId: number
    doctorName: string
    specialty: string
  }

  EditProfileScreen: {
    userInfo: {
      name: string
      email: string
      phone: string
      birthdate: string
      profileImage: any
    }
  }
  EditReviewScreen: {
    review: {
      id: number
      productId: number
      productName: string
      productImage: any
      rating: number
      content: string
      date: string
      images?: string[]
      likes: number
      helpful: number
    }
  }

  ProfileScreen: {
    updatedUserInfo?: {
      name: string
      email: string
      phone: string
      birthdate: string
      profileImage: any
    }
  }

  DiagnosisHistoryScreen: undefined
  DiagnosisDetailScreen: { diagnosisId: number }

  SkinHistoryScreen: undefined
}

export type DoctorStackParamList = {
  DoctorLogin: undefined
  DoctorRegister: undefined
  DoctorFindId: undefined
  DoctorFindPassword: undefined
  DoctorHome: undefined
  AppointmentSchedule: undefined
  PatientDetail: { patientId: number; appointmentId: number }
  DiagnosisWrite: { patientId: number; appointmentId: number }
  PatientHistory: undefined
  PatientHistoryDetail: { patientId: number }
  DoctorProfile: undefined
}
