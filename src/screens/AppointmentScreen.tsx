// 의사 예약 화면

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
  TextInput,
} from "react-native"
import { Calendar, type DateData } from "react-native-calendars"
import { type RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import LinearGradient from "react-native-linear-gradient"
import { launchCamera, launchImageLibrary } from "react-native-image-picker"

type AppointmentScreenRouteProp = RouteProp<
  { params: { doctorId: number; doctorName: string; specialty: string } },
  "params"
>

type ImageType = {
  uri: string
  type?: string
  name?: string
}

const AppointmentScreen = () => {
  const navigation = useNavigation()
  const route = useRoute<AppointmentScreenRouteProp>()
  const { doctorId, doctorName, specialty } = route.params

  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [markedDates, setMarkedDates] = useState<any>({})
  const [loading, setLoading] = useState(false)

  // 증상 관련 상태 추가
  const [symptoms, setSymptoms] = useState("")
  const [images, setImages] = useState<ImageType[]>([])

  // 오늘 날짜 구하기
  const today = new Date()
  const todayString = today.toISOString().split("T")[0]

  // 30일 후 날짜 구하기
  const maxDate = new Date()
  maxDate.setDate(today.getDate() + 30)
  const maxDateString = maxDate.toISOString().split("T")[0]

  // 선택 가능한 시간대 생성 (실제로는 API에서 가져올 수 있음)
  const generateAvailableTimes = (date: string) => {
    // 실제 앱에서는 API를 통해 해당 날짜의 가능한 시간을 가져옵니다
    setLoading(true)

    setTimeout(() => {
      const times = []
      const startHour = 9 // 오전 9시부터
      const endHour = 18 // 오후 6시까지

      // 주말인지 확인
      const selectedDate = new Date(date)
      const dayOfWeek = selectedDate.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

      if (isWeekend) {
        // 주말에는 시간이 더 적게 제공됨
        for (let hour = 10; hour <= 15; hour++) {
          if (Math.random() > 0.3) {
            // 70% 확률로 시간 슬롯 생성
            times.push(`${hour}:00`)
          }
          if (Math.random() > 0.5) {
            // 50% 확률로 30분 슬롯 생성
            times.push(`${hour}:30`)
          }
        }
      } else {
        // 평일
        for (let hour = startHour; hour <= endHour; hour++) {
          if (Math.random() > 0.2) {
            // 80% 확률로 시간 슬롯 생성
            times.push(`${hour}:00`)
          }
          if (Math.random() > 0.3) {
            // 70% 확률로 30분 슬롯 생성
            times.push(`${hour}:30`)
          }
        }
      }

      // 시간 순으로 정렬
      times.sort()
      setAvailableTimes(times)
      setLoading(false)
    }, 500) // 로딩 효과를 위한 지연
  }

  // 날짜 선택 핸들러
  const handleDateSelect = (date: DateData) => {
    const dateString = date.dateString

    // 이미 선택된 날짜를 다시 클릭하면 선택 취소
    if (dateString === selectedDate) {
      setSelectedDate("")
      setSelectedTime("")
      setAvailableTimes([])
      setMarkedDates({})
      return
    }

    setSelectedDate(dateString)
    setSelectedTime("")

    // 선택된 날짜 표시
    const newMarkedDates: any = {}
    newMarkedDates[dateString] = {
      selected: true,
      selectedColor: "#FF9A9E",
    }
    setMarkedDates(newMarkedDates)

    // 선택된 날짜에 대한 가능한 시간 생성
    generateAvailableTimes(dateString)
  }

  // 시간 선택 핸들러
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  // 이미지 선택 핸들러
  const handleSelectImage = () => {
    Alert.alert(
      "사진 첨부",
      "사진을 첨부할 방법을 선택하세요",
      [
        {
          text: "카메라로 촬영",
          onPress: () => handleLaunchCamera(),
        },
        {
          text: "갤러리에서 선택",
          onPress: () => handleLaunchImageLibrary(),
        },
        {
          text: "취소",
          style: "cancel",
        },
      ],
      { cancelable: true },
    )
  }

  // 카메라 실행 핸들러
  const handleLaunchCamera = () => {
    launchCamera(
      {
        mediaType: "photo",
        includeBase64: false,
        maxHeight: 800,
        maxWidth: 800,
      },
      (response) => {
        if (response.didCancel) {
          console.log("User cancelled camera picker")
        } else if (response.errorCode) {
          console.log("Camera Error: ", response.errorMessage)
        } else if (response.assets && response.assets.length > 0) {
          const asset = response.assets[0]
          if (asset.uri) {
            const newImage = {
              uri: asset.uri,
              type: asset.type,
              name: asset.fileName,
            }
            setImages([...images, newImage])
          }
        }
      },
    )
  }

  // 갤러리 실행 핸들러
  const handleLaunchImageLibrary = () => {
    launchImageLibrary(
      {
        mediaType: "photo",
        includeBase64: false,
        maxHeight: 800,
        maxWidth: 800,
        selectionLimit: 3 - images.length, // 최대 3장까지만 선택 가능
      },
      (response) => {
        if (response.didCancel) {
          console.log("User cancelled image picker")
        } else if (response.errorCode) {
          console.log("ImagePicker Error: ", response.errorMessage)
        } else if (response.assets && response.assets.length > 0) {
          const newImages = response.assets.map((asset) => ({
            uri: asset.uri || "",
            type: asset.type,
            name: asset.fileName,
          }))

          // 최대 3장까지만 추가
          const updatedImages = [...images, ...newImages].slice(0, 3)
          setImages(updatedImages)
        }
      },
    )
  }

  // 이미지 삭제 핸들러
  const handleRemoveImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
  }

  // 예약 완료 핸들러
  const handleConfirmAppointment = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert("알림", "날짜와 시간을 모두 선택해주세요.")
      return
    }

    // 여기서 실제로는 API를 통해 예약 정보를 서버에 전송합니다
    setLoading(true)

    // 예약 API 호출 시뮬레이션
    setTimeout(() => {
      setLoading(false)
      Alert.alert(
        "예약 완료",
        `${doctorName} 선생님과 ${selectedDate} ${selectedTime}에 예약이 완료되었습니다.${symptoms ? `\n\n증상: ${symptoms}` : ""}${images.length > 0 ? `\n\n첨부된 사진: ${images.length}장` : ""}`,
        [
          {
            text: "확인",
            onPress: () => navigation.goBack(),
          },
        ],
      )
    }, 1000)
  }

  // 시간 포맷 변환 (24시간 -> 12시간)
  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":")
    const hourNum = Number.parseInt(hour)

    if (hourNum < 12) {
      return `오전 ${hourNum}:${minute}`
    } else if (hourNum === 12) {
      return `오후 12:${minute}`
    } else {
      return `오후 ${hourNum - 12}:${minute}`
    }
  }

  // 날짜 포맷 변환 (YYYY-MM-DD -> YYYY년 MM월 DD일)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    return `${year}년 ${month}월 ${day}일`
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          
        </TouchableOpacity>
        <Text style={styles.headerTitle}>진료 예약</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 의사 정보 */}
        <View style={styles.doctorInfoCard}>
          <Image source={require("../assets/doctor1.png")} style={styles.doctorImage} />
          <Text style={styles.doctorName}>{doctorName}</Text>
          <Text style={styles.doctorSpecialty}>{specialty}</Text>
        </View>

        {/* 예약 안내 */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>예약 안내</Text>
          <Text style={styles.infoText}>• 예약은 30일 이내에만 가능합니다.</Text>
          <Text style={styles.infoText}>• 예약 취소는 24시간 전까지 가능합니다.</Text>
          <Text style={styles.infoText}>• 진료 시간은 약 15-20분 소요됩니다.</Text>
        </View>

        {/* 달력 */}
        <View style={styles.calendarContainer}>
          <Text style={styles.sectionTitle}>날짜 선택</Text>
          <Calendar
            minDate={todayString}
            maxDate={maxDateString}
            onDayPress={handleDateSelect}
            markedDates={markedDates}
            theme={{
              selectedDayBackgroundColor: "#FF9A9E",
              todayTextColor: "#FF9A9E",
              arrowColor: "#FF9A9E",
              dotColor: "#FF9A9E",
              textDayFontWeight: "500",
              textMonthFontWeight: "bold",
              textDayHeaderFontWeight: "500",
            }}
          />
        </View>

        {/* 시간 선택 */}
        {selectedDate && (
          <View style={styles.timeSelectionContainer}>
            <Text style={styles.sectionTitle}>시간 선택</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#FF9A9E" style={styles.loader} />
            ) : availableTimes.length > 0 ? (
              <View style={styles.timeGrid}>
                {availableTimes.map((time, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.timeButton, selectedTime === time && styles.timeButtonSelected]}
                    onPress={() => handleTimeSelect(time)}
                  >
                    <Text style={[styles.timeButtonText, selectedTime === time && styles.timeButtonTextSelected]}>
                      {formatTime(time)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.noTimesText}>선택한 날짜에 예약 가능한 시간이 없습니다.</Text>
            )}
          </View>
        )}

        {/* 증상 입력 */}
        <View style={styles.symptomsContainer}>
          <Text style={styles.sectionTitle}>증상 입력</Text>
          <TextInput
            style={styles.symptomsInput}
            placeholder="어떤 증상이 있으신가요? (선택사항)"
            placeholderTextColor="#ADB5BD"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={symptoms}
            onChangeText={setSymptoms}
          />
        </View>

        {/* 사진 첨부 */}
        <View style={styles.imagesContainer}>
          <Text style={styles.sectionTitle}>사진 첨부 (선택사항, 최대 3장)</Text>
          <View style={styles.imagesGrid}>
            {images.map((image, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri: image.uri }} style={styles.attachedImage} />
                <TouchableOpacity style={styles.removeImageButton} onPress={() => handleRemoveImage(index)}>
                  <Text style={styles.removeImageButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 3 && (
              <TouchableOpacity style={styles.addImageButton} onPress={handleSelectImage}>
                <Text style={styles.addImageButtonText}>+</Text>
                <Text style={styles.addImageButtonLabel}>사진 추가</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.imageHelpText}>증상과 관련된 사진을 첨부하시면 의사의 진단에 도움이 됩니다.</Text>
        </View>

        {/* 선택된 예약 정보 */}
        {selectedDate && selectedTime && (
          <View style={styles.selectedInfoContainer}>
            <Text style={styles.selectedInfoTitle}>선택한 예약 정보</Text>
            <View style={styles.selectedInfoRow}>
              <Text style={styles.selectedInfoLabel}>의사</Text>
              <Text style={styles.selectedInfoValue}>
                {doctorName} ({specialty})
              </Text>
            </View>
            <View style={styles.selectedInfoRow}>
              <Text style={styles.selectedInfoLabel}>날짜</Text>
              <Text style={styles.selectedInfoValue}>{formatDate(selectedDate)}</Text>
            </View>
            <View style={styles.selectedInfoRow}>
              <Text style={styles.selectedInfoLabel}>시간</Text>
              <Text style={styles.selectedInfoValue}>{formatTime(selectedTime)}</Text>
            </View>
          </View>
        )}

        {/* 하단 여백 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* 예약 버튼 */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={[styles.confirmButton, (!selectedDate || !selectedTime) && styles.confirmButtonDisabled]}
          onPress={handleConfirmAppointment}
          disabled={!selectedDate || !selectedTime || loading}
        >
          <LinearGradient
            colors={["#FF9A9E", "#FAD0C4"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.confirmButtonGradient}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.confirmButtonText}>예약하기</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#212529",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
  },
  placeholder: {
    width: 40,
  },
  doctorInfoCard: {
    margin: 20,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 5,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: "#6C757D",
  },
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9A9E",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#6C757D",
    marginBottom: 5,
  },
  calendarContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 15,
  },
  timeSelectionContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  timeButton: {
    width: "31%",
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  timeButtonSelected: {
    backgroundColor: "#FF9A9E",
    borderColor: "#FF9A9E",
  },
  timeButtonText: {
    fontSize: 12,
    color: "#6C757D",
  },
  timeButtonTextSelected: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  noTimesText: {
    fontSize: 14,
    color: "#6C757D",
    textAlign: "center",
    paddingVertical: 20,
  },
  loader: {
    marginVertical: 20,
  },
  // 증상 입력 스타일
  symptomsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  symptomsInput: {
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#212529",
    height: 100,
    textAlignVertical: "top",
  },
  // 이미지 첨부 스타일
  imagesContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  imageContainer: {
    width: 100,
    height: 100,
    marginRight: 10,
    marginBottom: 10,
    position: "relative",
  },
  attachedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FF9A9E",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  removeImageButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    borderStyle: "dashed",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addImageButtonText: {
    fontSize: 24,
    color: "#ADB5BD",
    marginBottom: 5,
  },
  addImageButtonLabel: {
    fontSize: 12,
    color: "#6C757D",
  },
  imageHelpText: {
    fontSize: 12,
    color: "#6C757D",
    fontStyle: "italic",
    marginTop: 5,
  },
  selectedInfoContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedInfoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 15,
  },
  selectedInfoRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  selectedInfoLabel: {
    width: 60,
    fontSize: 14,
    color: "#6C757D",
  },
  selectedInfoValue: {
    flex: 1,
    fontSize: 14,
    color: "#212529",
    fontWeight: "500",
  },
  bottomSpacer: {
    height: 100,
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F3F5",
  },
  confirmButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonGradient: {
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default AppointmentScreen
