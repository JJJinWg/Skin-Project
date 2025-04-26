// 예약내역 확인 화면

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ReservationHistoryScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>예약 내역 화면</Text>
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

export default ReservationHistoryScreen;