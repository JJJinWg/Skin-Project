import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import HomeScreen from "../screens/HomeScreen";
import ReservationScreen from "../screens/ReservationScreen";
import AppointmentScreen from "../screens/AppointmentScreen"; 
import FindCosmeticsScreen from "../screens/FindCosmeticsScreen";
import ProductReviewScreen from "../screens/ProductReviewScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import ReservationHistoryScreen from "../screens/ReservationHistoryScreen";
import RegisterUser from "../screens/RegisterUser";
import LoginForm from "../screens/LoginForm";
import WriteReviewScreen from "../screens/WriteReviewScreen";
import { RootStackParamList } from '../types/navigation';
import ProfileScreen from "../screens/ProfileScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import EditReviewScreen from "../screens/EditReviewScreen";
import DiagnosisHistoryScreen from "../screens/DiagnosisHistoryScreen";
import DiagnosisDetailScreen from "../screens/DiagnosisDetailScreen";
import SkinDiagnosisScreen from "../screens/SkinDiagnosisScreen"
import SkinAnalysisResultScreen from "../screens/SkinAnalysisResultScreen"
import SkinHistoryScreen from "../screens/SkinHistoryScreen"
import FindPasswordScreen from "../screens/FindPasswordScreen";
import FindIdScreen from "../screens/FindIdScreen";
import PharmacyMapScreen from "../screens/PharmacyMapScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

const StackNavigator = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isAuthenticated ? (
          // 비인증 상태의 스택
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginForm}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterUser}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="FindPasswordScreen" component={FindPasswordScreen} />
            <Stack.Screen name="FindIdScreen" component={FindIdScreen} />
          </>
        ) : (
          // 인증 상태의 스택
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="ReservationScreen" component={ReservationScreen} />
            <Stack.Screen name="AppointmentScreen" component={AppointmentScreen} /> 
            <Stack.Screen name="FindCosmeticsScreen" component={FindCosmeticsScreen} />
            <Stack.Screen name="ProductReviewScreen" component={ProductReviewScreen} />
            <Stack.Screen name="ProductDetailScreen" component={ProductDetailScreen} />
            <Stack.Screen name="ReservationHistoryScreen" component={ReservationHistoryScreen} />
            <Stack.Screen name="RegisterUser" component={RegisterUser} />
            <Stack.Screen name="WriteReviewScreen" component={WriteReviewScreen} />
            <Stack.Screen name="DoctorDetailScreen" component={ProductDetailScreen} />
            <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
            <Stack.Screen name="EditReviewScreen" component={EditReviewScreen} />
            <Stack.Screen name="DiagnosisHistoryScreen" component={DiagnosisHistoryScreen} />
            <Stack.Screen name="DiagnosisDetailScreen" component={DiagnosisDetailScreen} />
            <Stack.Screen name="SkinAnalysisResultScreen" component={SkinAnalysisResultScreen} />
            <Stack.Screen name="SkinDiagnosisScreen" component={SkinDiagnosisScreen} />
            <Stack.Screen name="SkinHistoryScreen" component={SkinHistoryScreen} />
            <Stack.Screen name="FindPasswordScreen" component={FindPasswordScreen} />
            <Stack.Screen name="FindIdScreen" component={FindIdScreen} />
            <Stack.Screen name="PharmacyMapScreen" component={PharmacyMapScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigator;