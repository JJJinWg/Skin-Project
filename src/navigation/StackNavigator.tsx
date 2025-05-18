import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import HomeScreen from "../screens/HomeScreen";
import ReservationScreen from "../screens/ReservationScreen";
import AppointmentScreen from "../screens/AppointmentScreen"; 
import SkinDiagnosisScreen from "../screens/SkinDiagnosisScreen";
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

const Stack = createStackNavigator<RootStackParamList>();

export default function StackNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="LoginForm" component={LoginForm} />
        <Stack.Screen name="ReservationScreen" component={ReservationScreen} />
        <Stack.Screen name="AppointmentScreen" component={AppointmentScreen} /> 
        <Stack.Screen name="SkinDiagnosisScreen" component={SkinDiagnosisScreen} />
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}