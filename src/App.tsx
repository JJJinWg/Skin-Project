import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import StackNavigator from './navigation/StackNavigator'; // StackNavigator 불러오기

const App: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#F5F5F5',
    flex: 1,
  };

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <StackNavigator /> {/* StackNavigator를 렌더링 */}
    </>
  );
};

export default App;