module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin', // 반드시 마지막에 추가해야 합니다.
  ],
};
