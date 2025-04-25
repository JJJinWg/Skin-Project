import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SkinDiagnosisScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>피부 진단 화면</Text>
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

export default SkinDiagnosisScreen;