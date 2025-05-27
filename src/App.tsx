import 'react-native-reanimated'; // 반드시 최상단에 추가
import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './store/index';
import { useDispatch } from 'react-redux';
import { logout, setCredentials } from './store/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StackNavigator from './navigation/StackNavigator'; // StackNavigator 불러오기

const AppContent = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 임시: AsyncStorage 초기화 (테스트용)
        await AsyncStorage.clear();
        console.log('AsyncStorage cleared for testing');
        
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          dispatch(setCredentials({ token }));
        } else {
          dispatch(logout());
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        dispatch(logout());
      }
    };

    checkAuth();
  }, [dispatch]);

  return <StackNavigator />;
};

const App: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#F5F5F5',
    flex: 1,
  };

  return (
    <Provider store={store}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <AppContent />
    </Provider>
  );
};

export default App;