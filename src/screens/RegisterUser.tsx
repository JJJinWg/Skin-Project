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
  ActivityIndicator,
} from 'react-native';

import { useNavigation } from '@react-navigation/native'; // React Navigation 사용
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { authService } from '../services/authService';

const RegisterUser: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'RegisterUser'>>(); // 네비게이션 객체 가져오기
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    age: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    phone: '',
  });

  const handleChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };


  // 유효성 검사 함수들
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password: string) => {
    // 8자 이상, 영문자, 숫자, 특수문자 포함
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return regex.test(password);
  };

  const validatePhone = (phone: string) => {
    const regex = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
    return regex.test(phone);
  };

  const validateAge = (age: string) => {
    const numAge = parseInt(age);
    return !isNaN(numAge) && numAge >= 1 && numAge <= 120;
  };

  const handleSubmit = async () => {
    // 필수 필드 검사
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      Alert.alert('알림', '필수 항목을 모두 입력해주세요.');
      return;
    }

    // 이메일 형식 검사
    if (!validateEmail(formData.email)) {
      Alert.alert('알림', '올바른 이메일 형식이 아닙니다.');
      return;
    }

    // 비밀번호 검사
    if (!validatePassword(formData.password)) {
      Alert.alert('알림', '비밀번호는 8자 이상이어야 하며, 영문자, 숫자, 특수문자를 각각 하나 이상 포함해야 합니다.');
      return;
    }

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
      return;
    }

    // 전화번호 검사
    if (formData.phone && !validatePhone(formData.phone)) {
      Alert.alert('알림', '올바른 전화번호 형식이 아닙니다.');
      return;
    }

    // 나이 검사
    if (formData.age && !validateAge(formData.age)) {
      Alert.alert('알림', '올바른 나이를 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        gender: formData.gender,
        age: formData.age,
        address: formData.address,
        phone: formData.phone,
      });

      Alert.alert(
        '회원가입 완료',
        '회원가입이 완료되었습니다.',
        [
          {
            text: '확인',
            onPress: () => navigation.navigate('LoginForm'),
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      Alert.alert('회원가입 실패', error instanceof Error ? error.message : '회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
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
          <Text style={styles.label}>이름 *</Text>
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
          <Text style={styles.label}>이메일 *</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(value) => handleChange('email', value)}
            placeholder="이메일을 입력하세요"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* 비밀번호 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>비밀번호 *</Text>
          <TextInput
            style={styles.input}
            value={formData.password}
            onChangeText={(value) => handleChange('password', value)}
            placeholder="비밀번호를 입력하세요"
            placeholderTextColor="#aaa"
            secureTextEntry
          />
        </View>

        {/* 비밀번호 확인 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>비밀번호 확인 *</Text>
          <TextInput
            style={styles.input}
            value={formData.confirmPassword}
            onChangeText={(value) => handleChange('confirmPassword', value)}
            placeholder="비밀번호를 다시 입력하세요"
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
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>회원가입</Text>
          )}
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
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterUser;