// 나의 피부에 맞는 화장품 추천 화면

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FindCosmeticsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>화장품 찾기 화면</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default FindCosmeticsScreen;