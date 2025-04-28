// src/screens/LoginForm.tsx
import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, Dimensions, KeyboardAvoidingView, Platform,
  TouchableWithoutFeedback, Keyboard, Alert, useColorScheme
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Svg, Path } from 'react-native-svg';
import { RootStackParamList } from '../types/navigation';

type LoginNavProp = StackNavigationProp<RootStackParamList, 'Login'>;

const { width } = Dimensions.get('window');

const LoginForm: React.FC = () => {
  const navigation = useNavigation<LoginNavProp>();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused,    setEmailFocused]    = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // 애니메이션용
  const emailLabelPos  = useState(new Animated.Value(email    ? -25 : 0))[0];
  const emailLabelSize = useState(new Animated.Value(email    ? 12  : 16))[0];
  const pwdLabelPos    = useState(new Animated.Value(password ? -25 : 0))[0];
  const pwdLabelSize   = useState(new Animated.Value(password ? 12  : 16))[0];

  const colorScheme = useColorScheme();
  const isDarkMode  = colorScheme === 'dark';

  const colors = {
    background: isDarkMode ? '#121212' : '#FFFFFF',
    card:       isDarkMode ? '#1E1E1E' : '#FFFFFF',
    primary:    '#FF5A5F',
    text:       isDarkMode ? '#FFFFFF' : '#333333',
    text2:      isDarkMode ? '#AAAAAA' : '#666666',
    border:     isDarkMode ? '#333333' : '#EEEEEE',
    inputBg:    isDarkMode ? '#2A2A2A' : '#F8F8F8',
    placeholder: isDarkMode ? '#777777' : '#999999',
  };

  function animateLabel(pos: Animated.Value, size: Animated.Value, focused: boolean, hasText: boolean) {
    Animated.parallel([
      Animated.timing(pos, {
        toValue: focused || hasText ? -25 : 0,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(size, {
        toValue: focused || hasText ? 12 : 16,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  }

  const handleLogin = () => {
    if (!email || !password) {
      return Alert.alert('이메일과 비밀번호를 입력해주세요.');
    }
    setIsLoading(true);
    // TODO: 실제 API 호출
    setTimeout(() => {
      setIsLoading(false);
      // 로그인 성공 시 replace 사용 예:      
      navigation.replace('Home', { userId: 'abc123' });
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          {/* 상단 웨이브 */}
          <View style={styles.waveContainer}>
            <Svg height={150} width={width} viewBox={`0 0 ${width} 150`}>
              <Path
                d={`M0 0L${width} 0L${width} 100C${width * 0.75} 130 ${width * 0.25} 80 0 100L0 0Z`}
                fill={colors.primary}
              />
            </Svg>
          </View>

          {/* 폼 */}
          <View style={[styles.formContainer, { backgroundColor: colors.card }]}>
            <Text style={[styles.title, { color: colors.text }]}>로그인</Text>
            <Text style={[styles.subtitle, { color: colors.text2 }]}>
              계정에 로그인하여 시작하세요
            </Text>

            {/* 이메일 */}
            <View style={styles.inputWrapper}>
              <Animated.Text
                style={[
                  styles.floatingLabel,
                  {
                    top:  emailLabelPos,
                    fontSize: emailLabelSize,
                    color: emailFocused ? colors.primary : colors.text2,
                  }
                ]}
              >
                이메일
              </Animated.Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: emailFocused ? colors.primary : colors.border,
                    backgroundColor: colors.inputBg,
                    color: colors.text,
                  }
                ]}
                value={email}
                onChangeText={setEmail}
                onFocus={() => {
                  animateLabel(emailLabelPos, emailLabelSize, true, !!email);
                  setEmailFocused(true);
                }}
                onBlur={() => {
                  animateLabel(emailLabelPos, emailLabelSize, false, !!email);
                  setEmailFocused(false);
                }}
                placeholder="example@mail.com"
                placeholderTextColor={colors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* 비밀번호 */}
            <View style={styles.inputWrapper}>
              <Animated.Text
                style={[
                  styles.floatingLabel,
                  {
                    top:  pwdLabelPos,
                    fontSize: pwdLabelSize,
                    color: passwordFocused ? colors.primary : colors.text2,
                  }
                ]}
              >
                비밀번호
              </Animated.Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: passwordFocused ? colors.primary : colors.border,
                    backgroundColor: colors.inputBg,
                    color: colors.text,
                  }
                ]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                onFocus={() => {
                  animateLabel(pwdLabelPos, pwdLabelSize, true, !!password);
                  setPasswordFocused(true);
                }}
                onBlur={() => {
                  animateLabel(pwdLabelPos, pwdLabelSize, false, !!password);
                  setPasswordFocused(false);
                }}
                placeholder="••••••••"
                placeholderTextColor={colors.placeholder}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setIsPasswordVisible(v => !v)}
              >
                <Text style={{ color: colors.text2 }}>
                  {isPasswordVisible ? '숨기기' : '표시'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 로그인 */}
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: colors.primary }]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? '로딩중...' : '로그인'}
              </Text>
            </TouchableOpacity>

            {/* 회원가입 이동 예시 */}
            <View style={styles.signupContainer}>
              <Text style={{ color: colors.text2 }}>계정이 없으신가요?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('RegisterUser')}>
                <Text style={[styles.signupLink, { color: colors.primary }]}> 회원가입</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default LoginForm;

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner:     { flex: 1 },
  waveContainer: { height: 150, width: '100%', position: 'relative' },
  formContainer: {
    flex: 1, marginTop: -20, borderTopLeftRadius: 30, borderTopRightRadius: 30,
    paddingHorizontal: 24, paddingTop: 40, paddingBottom: 24,
  },
  title:    { fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { fontSize: 16, marginBottom: 32, textAlign: 'center' },
  inputWrapper: { marginBottom: 24, position: 'relative' },
  floatingLabel: { position: 'absolute', left: 16, zIndex: 1 },
  input:    { height: 56, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingTop: 16 },
  eyeButton:{ position: 'absolute', right: 16, top: 18 },
  loginButton:    { height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  loginButtonText:{ color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  signupContainer:{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  signupLink: { fontWeight: '600' },
});
