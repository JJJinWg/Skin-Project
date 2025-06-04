// 회원가입 화면

import React, { useState, useEffect } from 'react';
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
import { useRegisterMutation } from '../store/api'; // RTK Query 훅 임포트

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

  // RTK Query 회원가입 훅 사용
  const [register, { isLoading, isSuccess, isError, error, data }] = useRegisterMutation();

  const handleChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => { // async 추가
    // 간단한 유효성 검사 (필요에 따라 강화)
    if (!formData.email || !formData.password || !formData.name) {
      Alert.alert('알림', '이름, 이메일, 비밀번호는 필수 입력 항목입니다.');
      return;
    }
    try {
      // register 뮤테이션 호출 (formData 전체를 전달)
      await register(formData).unwrap(); 
      // isSuccess, data 등을 사용하여 성공 처리 (아래 useEffect에서 처리)
    } catch (err) {
      // isError, error 등을 사용하여 에러 처리 (아래 useEffect에서 처리)
      // unwrap() 사용 시 에러는 여기서 catch 가능 (또는 useEffect에서 공통 처리)
    }
  };

  // 회원가입 성공/실패 처리 로직
  useEffect(() => { 
    if (isSuccess && data) {  // 현재 항상 성공
      Alert.alert(
        '회원가입 완료',
        data.message || '회원가입이 완료되었습니다.',
        [
          {
            text: '확인',
            // 회원가입 후 로그인 화면으로 이동하여 방금 만든 계정으로 로그인 유도
            onPress: () => navigation.replace('Login'),
          },
        ],
        { cancelable: false }
      );
    }
    if (isError && error) {
      if (typeof error === 'object' && error !== null && 'status' in error) {
        const errorData = (error as any).data;
        Alert.alert('회원가입 실패', (typeof errorData === 'string' ? errorData : errorData?.message) || '회원가입 중 오류가 발생했습니다.');
      } else {
        Alert.alert('회원가입 실패', '알 수 없는 오류가 발생했습니다.');
      }
    }
  }, [isSuccess, isError, error, data, navigation]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>회원가입</Text>
        <Text style={styles.subtitle}>회원가입 정보를 입력해주세요.</Text>

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
        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? '가입 처리 중...' : '회원가입'}</Text>
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