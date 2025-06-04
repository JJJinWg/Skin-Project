import { StyleSheet } from 'react-native'

export const profileStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "white",
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
  profileHeader: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#FFFFFF",
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FF9A9E",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  editIcon: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: "#6C757D",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: "#FF9A9E",
  },
  tabButtonText: {
    fontSize: 14,
    color: "#6C757D",
  },
  activeTabButtonText: {
    color: "#FF9A9E",
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  // 기본 정보 탭 스타일
  infoContainer: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "center",
  },
  infoLabel: {
    width: 80,
    fontSize: 14,
    color: "#6C757D",
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#6C757D",
  },
  editButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  editButtonGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  // 예약 내역 탭 스타일
  appointmentsContainer: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 14,
    color: "#6C757D",
  },
  appointmentsList: {
    paddingBottom: 20,
  },
  appointmentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  appointmentHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginTop: 5,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  specialty: {
    fontSize: 14,
    color: "#6C757D",
    marginBottom: 5,
  },
  appointmentDetails: {
    marginBottom: 10,
  },
  appointmentDate: {
    fontSize: 14,
    color: "#212529",
    marginBottom: 5,
  },
  appointmentSymptoms: {
    fontSize: 13,
    color: "#6C757D",
    fontStyle: "italic",
  },
  appointmentActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  rescheduleButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    marginRight: 10,
  },
  rescheduleButtonText: {
    fontSize: 12,
    color: "#6C757D",
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 12,
    color: "#EF4444",
  },
  noAppointmentsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  noAppointmentsText: {
    fontSize: 16,
    color: "#6C757D",
    marginBottom: 20,
  },
  makeAppointmentButton: {
    borderRadius: 12,
    overflow: "hidden",
    width: "100%",
  },
  makeAppointmentButtonGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  makeAppointmentButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  // 리뷰 내역 탭 스타일
  reviewsContainer: {
    flex: 1,
    padding: 20,
  },
  reviewsList: {
    paddingBottom: 20,
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  reviewHeaderInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  starsContainer: {
    flexDirection: "row",
    marginRight: 5,
  },
  starIcon: {
    fontSize: 14,
    color: "#FFC107",
    marginRight: 1,
  },
  emptyStar: {
    color: "#E9ECEF",
  },
  ratingText: {
    fontSize: 14,
    color: "#212529",
    marginLeft: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: "#6C757D",
  },
  reviewContent: {
    fontSize: 14,
    color: "#212529",
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewImagesContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  reviewStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F3F5",
  },
  reviewStatsText: {
    fontSize: 12,
    color: "#6C757D",
  },
  reviewActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  reviewActionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    marginLeft: 10,
  },
  reviewActionButtonText: {
    fontSize: 12,
    color: "#6C757D",
  },
  deleteButton: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FEE2E2",
  },
  deleteButtonText: {
    fontSize: 12,
    color: "#EF4444",
  },
  noReviewsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  noReviewsText: {
    fontSize: 16,
    color: "#6C757D",
    marginBottom: 20,
  },
  writeReviewButton: {
    borderRadius: 12,
    overflow: "hidden",
    width: "100%",
  },
  writeReviewButtonGradient: {
    paddingVertical: 15,
    alignItems: "center",
  },
  writeReviewButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  // 설정 탭 스타일
  settingsContainer: {
    padding: 20,
  },
  settingsSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingsSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
  },
  settingLabel: {
    fontSize: 14,
    color: "#212529",
  },
  settingValue: {
    fontSize: 14,
    color: "#6C757D",
  },
  settingButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
  },
  settingButtonText: {
    fontSize: 14,
    color: "#212529",
  },
  deleteAccountText: {
    color: "#EF4444",
  },
  // 진단 내역 탭 스타일
  diagnosesContainer: {
    flex: 1,
    padding: 20,
  },
  diagnosisList: {
    paddingBottom: 20,
  },
  diagnosisCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  diagnosisHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  doctorImageSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  diagnosisHeaderInfo: {
    flex: 1,
    justifyContent: "center",
  },
  diagnosisDate: {
    fontSize: 12,
    color: "#ADB5BD",
  },
  diagnosisSummary: {
    marginBottom: 8,
  },
  diagnosisLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 4,
  },
  diagnosisText: {
    fontSize: 14,
    color: "#495057",
    lineHeight: 20,
  },
  viewDetailButton: {
    alignSelf: "flex-end",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    marginTop: 8,
  },
  viewDetailButtonText: {
    fontSize: 12,
    color: "#6C757D",
  },
  noDiagnosisContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  noDiagnosisText: {
    fontSize: 16,
    color: "#6C757D",
    marginBottom: 8,
  },
  noDiagnosisSubtext: {
    fontSize: 14,
    color: "#ADB5BD",
    textAlign: "center",
    marginBottom: 20,
  },
}) 