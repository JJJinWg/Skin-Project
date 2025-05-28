// 회원가입 화면

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

import { useNavigation } from '@react-navigation/native'; // React Navigation 사용
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

const RegisterUser: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'RegisterUser'>>(); // 네비게이션 객체 가져오기
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    age: '',
    email: '',
    password: '',
    address: '',
    phone: '',
  });

  const handleChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = () => {
    console.log('Form Data Submitted:', formData);
    // 여기에 서버로 데이터를 전송하는 로직을 추가하세요.

    // 회원가입 완료 알림 및 홈 화면으로 이동
    Alert.alert(
      '회원가입 완료',
      '회원가입이 완료되었습니다.',
      [
        {
          text: '확인',
          onPress: () => navigation.navigate('HomeScreen'), // HomeScreen으로 이동
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>회원가입</Text>
        <Text style={styles.subtitle}>피부 진단 및 화장품 추천을 위해 정보를 입력하세요.</Text>

        {/* 이름 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>이름</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(value) => handleChange('name', value)}
            placeholder="이름을 입력하세요"
            placeholderTextColor="#aaa"
          />
        </View>

        {/* 성별 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>성별</Text>
          <TextInput
            style={styles.input}
            value={formData.gender}
            onChangeText={(value) => handleChange('gender', value)}
            placeholder="성별을 입력하세요"
            placeholderTextColor="#aaa"
          />
        </View>

        {/* 나이 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>나이</Text>
          <TextInput
            style={styles.input}
            value={formData.age}
            onChangeText={(value) => handleChange('age', value)}
            placeholder="나이를 입력하세요"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
          />
        </View>

        {/* 이메일 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>이메일</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(value) => handleChange('email', value)}
            placeholder="이메일을 입력하세요"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
          />
        </View>

        {/* 비밀번호 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>비밀번호</Text>
          <TextInput
            style={styles.input}
            value={formData.password}
            onChangeText={(value) => handleChange('password', value)}
            placeholder="비밀번호를 입력하세요"
            placeholderTextColor="#aaa"
            secureTextEntry
          />
        </View>

        {/* 주소 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>주소</Text>
          <TextInput
            style={styles.input}
            value={formData.address}
            onChangeText={(value) => handleChange('address', value)}
            placeholder="주소를 입력하세요"
            placeholderTextColor="#aaa"
          />
        </View>

        {/* 전화번호 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>전화번호</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(value) => handleChange('phone', value)}
            placeholder="전화번호를 입력하세요"
            placeholderTextColor="#aaa"
            keyboardType="phone-pad"
          />
        </View>

        {/* 회원가입 버튼 */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>회원가입</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#FF5A5F',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterUser;