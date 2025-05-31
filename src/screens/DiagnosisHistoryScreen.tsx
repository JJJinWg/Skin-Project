// // 프로필->진단내역 // 만들었다가 필요없어진 화면.
//
// import { useState, useEffect } from "react"
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   FlatList,
//   SafeAreaView,
//   StatusBar,
//   Image,
//   ActivityIndicator,
//   TextInput,
// } from "react-native"
// import { type NavigationProp, useNavigation } from "@react-navigation/native"
// import type { RootStackParamList } from "../types/navigation"
// import LinearGradient from "react-native-linear-gradient"

// // 진단 내역 타입 정의
// type Diagnosis = {
//   id: number
//   doctorId: number
//   doctorName: string
//   doctorImage: any
//   specialty: string
//   date: string
//   symptoms: string
//   diagnosisContent: string
//   treatment: string
//   prescriptions: string[]
//   followUpRequired: boolean
//   followUpDate?: string
//   images?: string[]
// }

// const DiagnosisHistoryScreen = () => {
//   const navigation = useNavigation<NavigationProp<RootStackParamList>>()
//   const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([])
//   const [filteredDiagnoses, setFilteredDiagnoses] = useState<Diagnosis[]>([])
//   const [loading, setLoading] = useState(true)
//   const [searchQuery, setSearchQuery] = useState("")
//   const [expandedDiagnosis, setExpandedDiagnosis] = useState<number | null>(null)

//   // 진단 내역 가져오기 (API 호출 시뮬레이션)
//   useEffect(() => {
//     setLoading(true)
//     // API 호출 시뮬레이션
//     setTimeout(() => {
//       const mockDiagnoses: Diagnosis[] = [
//         {
//           id: 1,
//           doctorId: 1,
//           doctorName: "Dr. Kim",
//           doctorImage: require("../assets/doctor1.png"),
//           specialty: "피부과",
//           date: "2023-05-15",
//           symptoms: "얼굴에 붉은 발진과 가려움증, 건조함",
//           diagnosisContent: "접촉성 피부염으로 진단됩니다. 특정 화장품이나 세안제에 대한 알레르기 반응으로 보입니다.",
//           treatment:
//             "스테로이드 연고를 처방해 드립니다. 하루에 두 번, 아침과 저녁에 발진 부위에 얇게 바르세요. 또한 자극이 적은 세안제와 보습제를 사용하시기 바랍니다.",
//           prescriptions: ["베타메타손 연고 0.05%", "세티리진 정 10mg"],
//           followUpRequired: true,
//           followUpDate: "2023-05-29",
//           images: ["https://example.com/diagnosis-image1.jpg"],
//         },
//         {
//           id: 2,
//           doctorId: 2,
//           doctorName: "Dr. Lee",
//           doctorImage: require("../assets/doctor2.png"),
//           specialty: "알레르기내과",
//           date: "2023-04-10",
//           symptoms: "재채기, 콧물, 눈 가려움증",
//           diagnosisContent: "계절성 알레르기성 비염입니다. 봄철 꽃가루에 대한 알레르기 반응으로 보입니다.",
//           treatment:
//             "항히스타민제를 처방해 드립니다. 증상이 심할 때 하루 한 번 복용하세요. 가능하면 외출 시 마스크를 착용하고, 귀가 후에는 세수를 하는 것이 좋습니다.",
//           prescriptions: ["로라타딘 정 10mg", "플루티카손 비강 스프레이"],
//           followUpRequired: false,
//         },
//         {
//           id: 3,
//           doctorId: 1,
//           doctorName: "Dr. Kim",
//           doctorImage: require("../assets/doctor1.png"),
//           specialty: "피부과",
//           date: "2023-03-05",
//           symptoms: "두피 가려움증, 비듬",
//           diagnosisContent: "지루성 피부염으로 진단됩니다. 두피의 과도한 유분 분비와 관련이 있습니다.",
//           treatment:
//             "항진균 샴푸를 처방해 드립니다. 일주일에 2-3회 사용하시고, 사용 시 거품을 내어 5분 정도 두피에 둔 후 헹구세요.",
//           prescriptions: ["케토코나졸 샴푸 2%"],
//           followUpRequired: true,
//           followUpDate: "2023-04-05",
//         },
//         {
//           id: 4,
//           doctorId: 3,
//           doctorName: "Dr. Park",
//           doctorImage: require("../assets/doctor3.png"),
//           specialty: "피부과",
//           date: "2023-02-20",
//           symptoms: "얼굴에 여드름, 붉은 염증",
//           diagnosisContent: "중등도의 여드름입니다. 호르몬 변화와 피지선 과다 활동으로 인한 것으로 보입니다.",
//           treatment:
//             "국소 항생제와 레티노이드 크림을 처방해 드립니다. 저녁에 세안 후 건조한 피부에 콩알 크기만큼 바르세요. 초기에는 건조함이나 약간의 자극이 있을 수 있습니다.",
//           prescriptions: ["클린다마이신 젤 1%", "트레티노인 크림 0.025%"],
//           followUpRequired: true,
//           followUpDate: "2023-03-20",
//           images: ["https://example.com/diagnosis-image2.jpg", "https://example.com/diagnosis-image3.jpg"],
//         },
//       ]
//       setDiagnoses(mockDiagnoses)
//       setFilteredDiagnoses(mockDiagnoses)
//       setLoading(false)
//     }, 1000)
//   }, [])

//   // 검색 기능
//   useEffect(() => {
//     if (searchQuery.trim() === "") {
//       setFilteredDiagnoses(diagnoses)
//     } else {
//       const filtered = diagnoses.filter(
//         (diagnosis) =>
//           diagnosis.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           diagnosis.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           diagnosis.diagnosisContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           diagnosis.symptoms.toLowerCase().includes(searchQuery.toLowerCase()),
//       )
//       setFilteredDiagnoses(filtered)
//     }
//   }, [searchQuery, diagnoses])

//   // 진단 내역 확장/축소 토글
//   const toggleExpand = (id: number) => {
//     setExpandedDiagnosis(expandedDiagnosis === id ? null : id)
//   }

//   // 상세 화면으로 이동
//   const navigateToDetail = (diagnosisId: number) => {
//     navigation.navigate("DiagnosisDetailScreen", { diagnosisId })
//   }

//   // 날짜 포맷 변환 (YYYY-MM-DD -> YYYY년 MM월 DD일)
//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString)
//     const year = date.getFullYear()
//     const month = date.getMonth() + 1
//     const day = date.getDate()

//     return `${year}년 ${month}월 ${day}일`
//   }

//   // 뒤로가기 처리
//   const handleBackPress = () => {
//     navigation.goBack()
//   }

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
// // 프로필->진단내역 // 만들었다가 필요없어진 화면.
//
// import { useState, useEffect } from "react"
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   FlatList,
//   SafeAreaView,
//   StatusBar,
//   Image,
//   ActivityIndicator,
//   TextInput,
// } from "react-native"
// import { type NavigationProp, useNavigation } from "@react-navigation/native"
// import type { RootStackParamList } from "../types/navigation"
// import LinearGradient from "react-native-linear-gradient"

// // 진단 내역 타입 정의
// type Diagnosis = {
//   id: number
//   doctorId: number
//   doctorName: string
//   doctorImage: any
//   specialty: string
//   date: string
//   symptoms: string
//   diagnosisContent: string
//   treatment: string
//   prescriptions: string[]
//   followUpRequired: boolean
//   followUpDate?: string
//   images?: string[]
// }

// const DiagnosisHistoryScreen = () => {
//   const navigation = useNavigation<NavigationProp<RootStackParamList>>()
//   const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([])
//   const [filteredDiagnoses, setFilteredDiagnoses] = useState<Diagnosis[]>([])
//   const [loading, setLoading] = useState(true)
//   const [searchQuery, setSearchQuery] = useState("")
//   const [expandedDiagnosis, setExpandedDiagnosis] = useState<number | null>(null)

//   // 진단 내역 가져오기 (API 호출 시뮬레이션)
//   useEffect(() => {
//     setLoading(true)
//     // API 호출 시뮬레이션
//     setTimeout(() => {
//       const mockDiagnoses: Diagnosis[] = [
//         {
//           id: 1,
//           doctorId: 1,
//           doctorName: "Dr. Kim",
//           doctorImage: require("../assets/doctor1.png"),
//           specialty: "피부과",
//           date: "2023-05-15",
//           symptoms: "얼굴에 붉은 발진과 가려움증, 건조함",
//           diagnosisContent: "접촉성 피부염으로 진단됩니다. 특정 화장품이나 세안제에 대한 알레르기 반응으로 보입니다.",
//           treatment:
//             "스테로이드 연고를 처방해 드립니다. 하루에 두 번, 아침과 저녁에 발진 부위에 얇게 바르세요. 또한 자극이 적은 세안제와 보습제를 사용하시기 바랍니다.",
//           prescriptions: ["베타메타손 연고 0.05%", "세티리진 정 10mg"],
//           followUpRequired: true,
//           followUpDate: "2023-05-29",
//           images: ["https://example.com/diagnosis-image1.jpg"],
//         },
//         {
//           id: 2,
//           doctorId: 2,
//           doctorName: "Dr. Lee",
//           doctorImage: require("../assets/doctor2.png"),
//           specialty: "알레르기내과",
//           date: "2023-04-10",
//           symptoms: "재채기, 콧물, 눈 가려움증",
//           diagnosisContent: "계절성 알레르기성 비염입니다. 봄철 꽃가루에 대한 알레르기 반응으로 보입니다.",
//           treatment:
//             "항히스타민제를 처방해 드립니다. 증상이 심할 때 하루 한 번 복용하세요. 가능하면 외출 시 마스크를 착용하고, 귀가 후에는 세수를 하는 것이 좋습니다.",
//           prescriptions: ["로라타딘 정 10mg", "플루티카손 비강 스프레이"],
//           followUpRequired: false,
//         },
//         {
//           id: 3,
//           doctorId: 1,
//           doctorName: "Dr. Kim",
//           doctorImage: require("../assets/doctor1.png"),
//           specialty: "피부과",
//           date: "2023-03-05",
//           symptoms: "두피 가려움증, 비듬",
//           diagnosisContent: "지루성 피부염으로 진단됩니다. 두피의 과도한 유분 분비와 관련이 있습니다.",
//           treatment:
//             "항진균 샴푸를 처방해 드립니다. 일주일에 2-3회 사용하시고, 사용 시 거품을 내어 5분 정도 두피에 둔 후 헹구세요.",
//           prescriptions: ["케토코나졸 샴푸 2%"],
//           followUpRequired: true,
//           followUpDate: "2023-04-05",
//         },
//         {
//           id: 4,
//           doctorId: 3,
//           doctorName: "Dr. Park",
//           doctorImage: require("../assets/doctor3.png"),
//           specialty: "피부과",
//           date: "2023-02-20",
//           symptoms: "얼굴에 여드름, 붉은 염증",
//           diagnosisContent: "중등도의 여드름입니다. 호르몬 변화와 피지선 과다 활동으로 인한 것으로 보입니다.",
//           treatment:
//             "국소 항생제와 레티노이드 크림을 처방해 드립니다. 저녁에 세안 후 건조한 피부에 콩알 크기만큼 바르세요. 초기에는 건조함이나 약간의 자극이 있을 수 있습니다.",
//           prescriptions: ["클린다마이신 젤 1%", "트레티노인 크림 0.025%"],
//           followUpRequired: true,
//           followUpDate: "2023-03-20",
//           images: ["https://example.com/diagnosis-image2.jpg", "https://example.com/diagnosis-image3.jpg"],
//         },
//       ]
//       setDiagnoses(mockDiagnoses)
//       setFilteredDiagnoses(mockDiagnoses)
//       setLoading(false)
//     }, 1000)
//   }, [])

//   // 검색 기능
//   useEffect(() => {
//     if (searchQuery.trim() === "") {
//       setFilteredDiagnoses(diagnoses)
//     } else {
//       const filtered = diagnoses.filter(
//         (diagnosis) =>
//           diagnosis.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           diagnosis.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           diagnosis.diagnosisContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           diagnosis.symptoms.toLowerCase().includes(searchQuery.toLowerCase()),
//       )
//       setFilteredDiagnoses(filtered)
//     }
//   }, [searchQuery, diagnoses])

//   // 진단 내역 확장/축소 토글
//   const toggleExpand = (id: number) => {
//     setExpandedDiagnosis(expandedDiagnosis === id ? null : id)
//   }

//   // 상세 화면으로 이동
//   const navigateToDetail = (diagnosisId: number) => {
//     navigation.navigate("DiagnosisDetailScreen", { diagnosisId })
//   }

//   // 날짜 포맷 변환 (YYYY-MM-DD -> YYYY년 MM월 DD일)
//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString)
//     const year = date.getFullYear()
//     const month = date.getMonth() + 1
//     const day = date.getDate()

//     return `${year}년 ${month}월 ${day}일`
//   }

//   // 뒤로가기 처리
//   const handleBackPress = () => {
//     navigation.goBack()
//   }

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

//       {/* 헤더 */}
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
//           <Text style={styles.backButtonText}>←</Text>
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>진단 내역</Text>
//         <View style={styles.placeholder} />
//       </View>

//       {/* 검색 바 */}
//       <View style={styles.searchContainer}>
//         <View style={styles.searchBar}>
//           <Text style={styles.searchIcon}>🔍</Text>
//           <TextInput
//             style={styles.searchInput}
//             placeholder="의사, 진료과, 증상 등으로 검색"
//             placeholderTextColor="#ADB5BD"
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//           />
//           {searchQuery ? (
//             <TouchableOpacity onPress={() => setSearchQuery("")}>
//               <Text style={styles.clearIcon}>✕</Text>
//             </TouchableOpacity>
//           ) : null}
//         </View>
//       </View>

//       {/* 진단 내역 목록 */}
//       {loading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#FF9A9E" />
//           <Text style={styles.loadingText}>진단 내역을 불러오는 중...</Text>
//         </View>
//       ) : filteredDiagnoses.length > 0 ? (
//         <FlatList
//           data={filteredDiagnoses}
//           keyExtractor={(item) => item.id.toString()}
//           renderItem={({ item }) => (
//             <TouchableOpacity style={styles.diagnosisCard} onPress={() => toggleExpand(item.id)}>
//               <View style={styles.diagnosisHeader}>
//                 <Image source={item.doctorImage} style={styles.doctorImage} />
//                 <View style={styles.diagnosisHeaderInfo}>
//                   <Text style={styles.doctorName}>{item.doctorName}</Text>
//                   <Text style={styles.specialty}>{item.specialty}</Text>
//                   <Text style={styles.diagnosisDate}>{formatDate(item.date)}</Text>
//                 </View>
//                 <Text style={styles.expandIcon}>{expandedDiagnosis === item.id ? "▲" : "▼"}</Text>
//               </View>

//               <View style={styles.diagnosisSummary}>
//                 <Text style={styles.diagnosisLabel}>주요 증상:</Text>
//                 <Text style={styles.diagnosisText} numberOfLines={expandedDiagnosis === item.id ? 0 : 1}>
//                   {item.symptoms}
//                 </Text>
//               </View>

//               <View style={styles.diagnosisSummary}>
//                 <Text style={styles.diagnosisLabel}>진단:</Text>
//                 <Text style={styles.diagnosisText} numberOfLines={expandedDiagnosis === item.id ? 0 : 1}>
//                   {item.diagnosisContent}
//                 </Text>
//               </View>

//               {expandedDiagnosis === item.id && (
//                 <View style={styles.expandedContent}>
//                   <View style={styles.diagnosisDetail}>
//                     <Text style={styles.diagnosisDetailLabel}>치료 계획:</Text>
//                     <Text style={styles.diagnosisDetailText}>{item.treatment}</Text>
//                   </View>

//                   <View style={styles.diagnosisDetail}>
//                     <Text style={styles.diagnosisDetailLabel}>처방약:</Text>
//                     {item.prescriptions.map((prescription, index) => (
//                       <Text key={index} style={styles.prescriptionItem}>
//                         • {prescription}
//                       </Text>
//                     ))}
//                   </View>

//                   {item.followUpRequired && (
//                     <View style={styles.diagnosisDetail}>
//                       <Text style={styles.diagnosisDetailLabel}>추적 관찰:</Text>
//                       <Text style={styles.diagnosisDetailText}>
//                         {item.followUpDate ? `${formatDate(item.followUpDate)}에 재방문 필요` : "재방문 필요"}
//                       </Text>
//                     </View>
//                   )}

//                   {item.images && item.images.length > 0 && (
//                     <View style={styles.diagnosisDetail}>
//                       <Text style={styles.diagnosisDetailLabel}>진단 이미지:</Text>
//                       <View style={styles.diagnosisImagesContainer}>
//                         {item.images.map((image, index) => (
//                           <Image key={index} source={{ uri: image }} style={styles.diagnosisImage} />
//                         ))}
//                       </View>
//                     </View>
//                   )}

//                   <View style={styles.actionButtonsContainer}>
//                     <TouchableOpacity style={styles.detailButton} onPress={() => navigateToDetail(item.id)}>
//                       <Text style={styles.detailButtonText}>상세보기</Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity
//                       style={styles.appointmentButton}
//                       onPress={() =>
//                         navigation.navigate("AppointmentScreen", {
//                           doctorId: item.doctorId,
//                           doctorName: item.doctorName,
//                           specialty: item.specialty,
//                         })
//                       }
//                     >
//                       <LinearGradient
//                         colors={["#FF9A9E", "#FAD0C4"]}
//                         start={{ x: 0, y: 0 }}
//                         end={{ x: 1, y: 0 }}
//                         style={styles.appointmentButtonGradient}
//                       >
//                         <Text style={styles.appointmentButtonText}>예약하기</Text>
//                       </LinearGradient>
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               )}
//             </TouchableOpacity>
//           )}
//           contentContainerStyle={styles.diagnosisList}
//           showsVerticalScrollIndicator={false}
//         />
//       ) : (
//         <View style={styles.noDiagnosisContainer}>
//           <Text style={styles.noDiagnosisText}>진단 내역이 없습니다.</Text>
//           <Text style={styles.noDiagnosisSubtext}>
//             {searchQuery ? "검색 조건을 변경해 보세요." : "의사의 진단을 받은 후에 이곳에서 확인할 수 있습니다."}
//           </Text>
//           {!searchQuery && (
//             <TouchableOpacity
//               style={styles.makeAppointmentButton}
//               onPress={() => navigation.navigate("ReservationScreen")}
//             >
//               <LinearGradient
//                 colors={["#FF9A9E", "#FAD0C4"]}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 0 }}
//                 style={styles.makeAppointmentButtonGradient}
//               >
//                 <Text style={styles.makeAppointmentButtonText}>진료 예약하기</Text>
//               </LinearGradient>
//             </TouchableOpacity>
//           )}
//         </View>
//       )}
//     </SafeAreaView>
//   )
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: "#FFFFFF",
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     backgroundColor: "#FFFFFF",
//     borderBottomWidth: 1,
//     borderBottomColor: "#F1F3F5",
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "#F8F9FA",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   backButtonText: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#212529",
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#212529",
//   },
//   placeholder: {
//     width: 40,
//   },
//   searchContainer: {
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     backgroundColor: "#FFFFFF",
//   },
//   searchBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#F8F9FA",
//     borderRadius: 12,
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//     borderWidth: 1,
//     borderColor: "#E9ECEF",
//   },
//   searchIcon: {
//     fontSize: 16,
//     marginRight: 10,
//     color: "#ADB5BD",
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 14,
//     color: "#212529",
//     padding: 0,
//   },
//   clearIcon: {
//     fontSize: 16,
//     color: "#ADB5BD",
//     padding: 5,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 14,
//     color: "#6C757D",
//   },
//   diagnosisList: {
//     padding: 20,
//   },
//   diagnosisCard: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     padding: 15,
//     marginBottom: 15,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   diagnosisHeader: {
//     flexDirection: "row",
//     marginBottom: 15,
//   },
//   doctorImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     marginRight: 12,
//   },
//   diagnosisHeaderInfo: {
//     flex: 1,
//     justifyContent: "center",
//   },
//   doctorName: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#212529",
//     marginBottom: 2,
//   },
//   specialty: {
//     fontSize: 12,
//     color: "#6C757D",
//     marginBottom: 2,
//   },
//   diagnosisDate: {
//     fontSize: 12,
//     color: "#ADB5BD",
//   },
//   expandIcon: {
//     fontSize: 16,
//     color: "#ADB5BD",
//     alignSelf: "center",
//   },
//   diagnosisSummary: {
//     marginBottom: 10,
//   },
//   diagnosisLabel: {
//     fontSize: 14,
//     fontWeight: "bold",
//     color: "#212529",
//     marginBottom: 4,
//   },
//   diagnosisText: {
//     fontSize: 14,
//     color: "#495057",
//     lineHeight: 20,
//   },
//   expandedContent: {
//     marginTop: 10,
//     paddingTop: 15,
//     borderTopWidth: 1,
//     borderTopColor: "#F1F3F5",
//   },
//   diagnosisDetail: {
//     marginBottom: 15,
//   },
//   diagnosisDetailLabel: {
//     fontSize: 14,
//     fontWeight: "bold",
//     color: "#212529",
//     marginBottom: 6,
//   },
//   diagnosisDetailText: {
//     fontSize: 14,
//     color: "#495057",
//     lineHeight: 20,
//   },
//   prescriptionItem: {
//     fontSize: 14,
//     color: "#495057",
//     lineHeight: 22,
//     marginLeft: 5,
//   },
//   diagnosisImagesContainer: {
//     flexDirection: "row",
//     marginTop: 8,
//   },
//   diagnosisImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 8,
//     marginRight: 10,
//   },
//   actionButtonsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 15,
//   },
//   detailButton: {
//     flex: 1,
//     marginRight: 8,
//     paddingVertical: 12,
//     alignItems: "center",
//     backgroundColor: "#F8F9FA",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#E9ECEF",
//   },
//   detailButtonText: {
//     fontSize: 14,
//     fontWeight: "500",
//     color: "#495057",
//   },
//   appointmentButton: {
//     flex: 1,
//     marginLeft: 8,
//     borderRadius: 12,
//     overflow: "hidden",
//   },
//   appointmentButtonGradient: {
//     paddingVertical: 12,
//     alignItems: "center",
//   },
//   appointmentButtonText: {
//     color: "#FFFFFF",
//     fontSize: 14,
//     fontWeight: "bold",
//   },
//   noDiagnosisContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 20,
//   },
//   noDiagnosisText: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#212529",
//     marginBottom: 8,
//   },
//   noDiagnosisSubtext: {
//     fontSize: 14,
//     color: "#6C757D",
//     textAlign: "center",
//     marginBottom: 20,
//   },
//   makeAppointmentButton: {
//     width: "100%",
//     borderRadius: 12,
//     overflow: "hidden",
//   },
//   makeAppointmentButtonGradient: {
//     paddingVertical: 15,
//     alignItems: "center",
//   },
//   makeAppointmentButtonText: {
//     color: "#FFFFFF",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
// })
//       {/* 헤더 */}
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
//           <Text style={styles.backButtonText}>←</Text>
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>진단 내역</Text>
//         <View style={styles.placeholder} />
//       </View>

//       {/* 검색 바 */}
//       <View style={styles.searchContainer}>
//         <View style={styles.searchBar}>
//           <Text style={styles.searchIcon}>🔍</Text>
//           <TextInput
//             style={styles.searchInput}
//             placeholder="의사, 진료과, 증상 등으로 검색"
//             placeholderTextColor="#ADB5BD"
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//           />
//           {searchQuery ? (
//             <TouchableOpacity onPress={() => setSearchQuery("")}>
//               <Text style={styles.clearIcon}>✕</Text>
//             </TouchableOpacity>
//           ) : null}
//         </View>
//       </View>

//       {/* 진단 내역 목록 */}
//       {loading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#FF9A9E" />
//           <Text style={styles.loadingText}>진단 내역을 불러오는 중...</Text>
//         </View>
//       ) : filteredDiagnoses.length > 0 ? (
//         <FlatList
//           data={filteredDiagnoses}
//           keyExtractor={(item) => item.id.toString()}
//           renderItem={({ item }) => (
//             <TouchableOpacity style={styles.diagnosisCard} onPress={() => toggleExpand(item.id)}>
//               <View style={styles.diagnosisHeader}>
//                 <Image source={item.doctorImage} style={styles.doctorImage} />
//                 <View style={styles.diagnosisHeaderInfo}>
//                   <Text style={styles.doctorName}>{item.doctorName}</Text>
//                   <Text style={styles.specialty}>{item.specialty}</Text>
//                   <Text style={styles.diagnosisDate}>{formatDate(item.date)}</Text>
//                 </View>
//                 <Text style={styles.expandIcon}>{expandedDiagnosis === item.id ? "▲" : "▼"}</Text>
//               </View>

//               <View style={styles.diagnosisSummary}>
//                 <Text style={styles.diagnosisLabel}>주요 증상:</Text>
//                 <Text style={styles.diagnosisText} numberOfLines={expandedDiagnosis === item.id ? 0 : 1}>
//                   {item.symptoms}
//                 </Text>
//               </View>

//               <View style={styles.diagnosisSummary}>
//                 <Text style={styles.diagnosisLabel}>진단:</Text>
//                 <Text style={styles.diagnosisText} numberOfLines={expandedDiagnosis === item.id ? 0 : 1}>
//                   {item.diagnosisContent}
//                 </Text>
//               </View>

//               {expandedDiagnosis === item.id && (
//                 <View style={styles.expandedContent}>
//                   <View style={styles.diagnosisDetail}>
//                     <Text style={styles.diagnosisDetailLabel}>치료 계획:</Text>
//                     <Text style={styles.diagnosisDetailText}>{item.treatment}</Text>
//                   </View>

//                   <View style={styles.diagnosisDetail}>
//                     <Text style={styles.diagnosisDetailLabel}>처방약:</Text>
//                     {item.prescriptions.map((prescription, index) => (
//                       <Text key={index} style={styles.prescriptionItem}>
//                         • {prescription}
//                       </Text>
//                     ))}
//                   </View>

//                   {item.followUpRequired && (
//                     <View style={styles.diagnosisDetail}>
//                       <Text style={styles.diagnosisDetailLabel}>추적 관찰:</Text>
//                       <Text style={styles.diagnosisDetailText}>
//                         {item.followUpDate ? `${formatDate(item.followUpDate)}에 재방문 필요` : "재방문 필요"}
//                       </Text>
//                     </View>
//                   )}

//                   {item.images && item.images.length > 0 && (
//                     <View style={styles.diagnosisDetail}>
//                       <Text style={styles.diagnosisDetailLabel}>진단 이미지:</Text>
//                       <View style={styles.diagnosisImagesContainer}>
//                         {item.images.map((image, index) => (
//                           <Image key={index} source={{ uri: image }} style={styles.diagnosisImage} />
//                         ))}
//                       </View>
//                     </View>
//                   )}

//                   <View style={styles.actionButtonsContainer}>
//                     <TouchableOpacity style={styles.detailButton} onPress={() => navigateToDetail(item.id)}>
//                       <Text style={styles.detailButtonText}>상세보기</Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity
//                       style={styles.appointmentButton}
//                       onPress={() =>
//                         navigation.navigate("AppointmentScreen", {
//                           doctorId: item.doctorId,
//                           doctorName: item.doctorName,
//                           specialty: item.specialty,
//                         })
//                       }
//                     >
//                       <LinearGradient
//                         colors={["#FF9A9E", "#FAD0C4"]}
//                         start={{ x: 0, y: 0 }}
//                         end={{ x: 1, y: 0 }}
//                         style={styles.appointmentButtonGradient}
//                       >
//                         <Text style={styles.appointmentButtonText}>예약하기</Text>
//                       </LinearGradient>
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               )}
//             </TouchableOpacity>
//           )}
//           contentContainerStyle={styles.diagnosisList}
//           showsVerticalScrollIndicator={false}
//         />
//       ) : (
//         <View style={styles.noDiagnosisContainer}>
//           <Text style={styles.noDiagnosisText}>진단 내역이 없습니다.</Text>
//           <Text style={styles.noDiagnosisSubtext}>
//             {searchQuery ? "검색 조건을 변경해 보세요." : "의사의 진단을 받은 후에 이곳에서 확인할 수 있습니다."}
//           </Text>
//           {!searchQuery && (
//             <TouchableOpacity
//               style={styles.makeAppointmentButton}
//               onPress={() => navigation.navigate("ReservationScreen")}
//             >
//               <LinearGradient
//                 colors={["#FF9A9E", "#FAD0C4"]}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 0 }}
//                 style={styles.makeAppointmentButtonGradient}
//               >
//                 <Text style={styles.makeAppointmentButtonText}>진료 예약하기</Text>
//               </LinearGradient>
//             </TouchableOpacity>
//           )}
//         </View>
//       )}
//     </SafeAreaView>
//   )
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: "#FFFFFF",
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     backgroundColor: "#FFFFFF",
//     borderBottomWidth: 1,
//     borderBottomColor: "#F1F3F5",
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "#F8F9FA",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   backButtonText: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#212529",
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#212529",
//   },
//   placeholder: {
//     width: 40,
//   },
//   searchContainer: {
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     backgroundColor: "#FFFFFF",
//   },
//   searchBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#F8F9FA",
//     borderRadius: 12,
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//     borderWidth: 1,
//     borderColor: "#E9ECEF",
//   },
//   searchIcon: {
//     fontSize: 16,
//     marginRight: 10,
//     color: "#ADB5BD",
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 14,
//     color: "#212529",
//     padding: 0,
//   },
//   clearIcon: {
//     fontSize: 16,
//     color: "#ADB5BD",
//     padding: 5,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 14,
//     color: "#6C757D",
//   },
//   diagnosisList: {
//     padding: 20,
//   },
//   diagnosisCard: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     padding: 15,
//     marginBottom: 15,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   diagnosisHeader: {
//     flexDirection: "row",
//     marginBottom: 15,
//   },
//   doctorImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     marginRight: 12,
//   },
//   diagnosisHeaderInfo: {
//     flex: 1,
//     justifyContent: "center",
//   },
//   doctorName: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#212529",
//     marginBottom: 2,
//   },
//   specialty: {
//     fontSize: 12,
//     color: "#6C757D",
//     marginBottom: 2,
//   },
//   diagnosisDate: {
//     fontSize: 12,
//     color: "#ADB5BD",
//   },
//   expandIcon: {
//     fontSize: 16,
//     color: "#ADB5BD",
//     alignSelf: "center",
//   },
//   diagnosisSummary: {
//     marginBottom: 10,
//   },
//   diagnosisLabel: {
//     fontSize: 14,
//     fontWeight: "bold",
//     color: "#212529",
//     marginBottom: 4,
//   },
//   diagnosisText: {
//     fontSize: 14,
//     color: "#495057",
//     lineHeight: 20,
//   },
//   expandedContent: {
//     marginTop: 10,
//     paddingTop: 15,
//     borderTopWidth: 1,
//     borderTopColor: "#F1F3F5",
//   },
//   diagnosisDetail: {
//     marginBottom: 15,
//   },
//   diagnosisDetailLabel: {
//     fontSize: 14,
//     fontWeight: "bold",
//     color: "#212529",
//     marginBottom: 6,
//   },
//   diagnosisDetailText: {
//     fontSize: 14,
//     color: "#495057",
//     lineHeight: 20,
//   },
//   prescriptionItem: {
//     fontSize: 14,
//     color: "#495057",
//     lineHeight: 22,
//     marginLeft: 5,
//   },
//   diagnosisImagesContainer: {
//     flexDirection: "row",
//     marginTop: 8,
//   },
//   diagnosisImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 8,
//     marginRight: 10,
//   },
//   actionButtonsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 15,
//   },
//   detailButton: {
//     flex: 1,
//     marginRight: 8,
//     paddingVertical: 12,
//     alignItems: "center",
//     backgroundColor: "#F8F9FA",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#E9ECEF",
//   },
//   detailButtonText: {
//     fontSize: 14,
//     fontWeight: "500",
//     color: "#495057",
//   },
//   appointmentButton: {
//     flex: 1,
//     marginLeft: 8,
//     borderRadius: 12,
//     overflow: "hidden",
//   },
//   appointmentButtonGradient: {
//     paddingVertical: 12,
//     alignItems: "center",
//   },
//   appointmentButtonText: {
//     color: "#FFFFFF",
//     fontSize: 14,
//     fontWeight: "bold",
//   },
//   noDiagnosisContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 20,
//   },
//   noDiagnosisText: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#212529",
//     marginBottom: 8,
//   },
//   noDiagnosisSubtext: {
//     fontSize: 14,
//     color: "#6C757D",
//     textAlign: "center",
//     marginBottom: 20,
//   },
//   makeAppointmentButton: {
//     width: "100%",
//     borderRadius: 12,
//     overflow: "hidden",
//   },
//   makeAppointmentButtonGradient: {
//     paddingVertical: 15,
//     alignItems: "center",
//   },
//   makeAppointmentButtonText: {
//     color: "#FFFFFF",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
// })

// export default DiagnosisHistoryScreen
// export default DiagnosisHistoryScreen
