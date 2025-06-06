import type React from "react"
import { TouchableOpacity, Text, StyleSheet, type ViewStyle, type TextStyle, useColorScheme } from "react-native"

interface SocialButtonProps {
  title: string
  onPress: () => void
  style?: ViewStyle
  textStyle?: TextStyle
}

const SocialButton: React.FC<SocialButtonProps> = ({ title, onPress, style, textStyle }) => {
  const isDarkMode = useColorScheme() === "dark"

  const styles = StyleSheet.create({
    button: {
      backgroundColor: isDarkMode ? "#333333" : "#FFFFFF",
      borderWidth: 1,
      borderColor: isDarkMode ? "#444444" : "#DDDDDD",
      borderRadius: 12,
      padding: 15,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    },
    text: {
      fontSize: 16,
      color: isDarkMode ? "#FFFFFF" : "#333333",
    },
  })

  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  )
}

export default SocialButton
