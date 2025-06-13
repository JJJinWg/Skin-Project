import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  Platform, 
  PermissionsAndroid, 
  Alert, 
  TouchableOpacity, 
  TextInput, 
  FlatList,
  Dimensions,
  ActivityIndicator,
  Linking,
  NativeModules,
  ScrollView
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import Geolocation, { GeolocationError } from '@react-native-community/geolocation';
import { SafeAreaView } from 'react-native-safe-area-context';

const GOOGLE_MAPS_API_KEY = 'AIzaSyA56Pzyczr7ZJyDOh_0Gk54EfdPiyxL5eU';

interface Location {
  latitude: number;
  longitude: number;
}

// 아산 탕정면 기본 위치
const DEFAULT_LOCATION: Location = {
  latitude: 36.7947,  // 아산 탕정면 위도
  longitude: 127.0872 // 아산 탕정면 경도
};

// 구글 본사 근처 위치 (에뮬레이터 기본값)
const GOOGLE_HQ_LOCATION: Location = {
  latitude: 37.4219983,
  longitude: -122.084
};

// 에뮬레이터 감지 개선
const isEmulator = Platform.select({
  android: () => {
    const { PlatformConstants } = NativeModules;
    return !!(
      PlatformConstants?.Brand?.toLowerCase().includes('google') ||
      PlatformConstants?.Manufacturer?.toLowerCase().includes('google') ||
      PlatformConstants?.Fingerprint?.toLowerCase().includes('generic') ||
      PlatformConstants?.Model?.toLowerCase().includes('sdk')
    );
  },
  ios: () => {
    return NativeModules.PlatformConstants?.Model?.toLowerCase().includes('simulator');
  },
  default: () => false,
})() || false;

// 위치가 에뮬레이터의 기본값인지 확인
const isEmulatorLocation = (lat: number, lng: number) => {
  const latDiff = Math.abs(lat - GOOGLE_HQ_LOCATION.latitude);
  const lngDiff = Math.abs(lng - GOOGLE_HQ_LOCATION.longitude);
  return latDiff < 1 && lngDiff < 1; // 1도 이내의 차이는 에뮬레이터로 간주
};

// Google Maps API 관련 타입 정의
declare namespace google.maps {
  namespace places {
    enum PlacesServiceStatus {
      OK,
      ZERO_RESULTS,
      OVER_QUERY_LIMIT,
      REQUEST_DENIED,
      INVALID_REQUEST
    }
  }
}

interface Position {
  coords: {
    latitude: number;
    longitude: number;
  };
}

interface Pharmacy {
  place_id: string;
  name: string;
  vicinity: string;
  lat: number;
  lng: number;
  address?: string;
  phone?: string;
  rating?: number;
  opening_hours?: string[];
  distance?: number;
  isOpen?: boolean;
}

interface WebViewMessage {
  type: 'MAP_LOADED' | 'MARKER_CLICKED' | 'ERROR';
  data?: any;
  message?: string;
}

const PharmacyMapScreen = () => {
  const [currentLocation, setCurrentLocation] = useState<Location>(DEFAULT_LOCATION);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean>(false);
  const webViewRef = useRef<WebView>(null);

  // 검색 반경 상수 정의 (미터 단위)
  const SEARCH_RADIUS = 3000; // 3km

  // 위치 권한 확인
  const checkLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "위치 권한 필요",
            message: "주변 약국을 찾기 위해 위치 권한이 필요합니다.",
            buttonNeutral: "나중에 묻기",
            buttonNegative: "거부",
            buttonPositive: "허용"
          }
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('위치 권한 허용됨');
          setHasLocationPermission(true);
          return true;
        } else {
          console.log('위치 권한 거부됨');
          setError('위치 권한이 거부되었습니다. 설정에서 위치 권한을 허용해주세요.');
          setHasLocationPermission(false);
          return false;
        }
      } catch (err) {
        console.warn(err);
        setError('위치 권한 확인 중 오류가 발생했습니다.');
        return false;
      }
    } else {
      // iOS의 경우 Geolocation 요청 시 자동으로 권한 요청
      setHasLocationPermission(true);
      return true;
    }
  };

  const getCurrentLocation = async () => {
    console.log('Getting current location...');
    setIsLoading(true);
    setError(null);

    // 위치 권한 확인
    const hasPermission = await checkLocationPermission();
    if (!hasPermission) {
      setIsLoading(false);
      return;
    }

    // GPS가 켜져있는지 확인 (Android only)
    if (Platform.OS === 'android') {
      try {
        const locationEnabled = await NativeModules.LocationModule.isLocationEnabled();
        if (!locationEnabled) {
          setError('GPS가 꺼져 있습니다. GPS를 켜고 다시 시도해주세요.');
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('GPS 상태 확인 실패:', err);
      }
    }

    // 위치 정보 가져오기 시도 (저정확도)
    const getLocationWithAccuracy = (highAccuracy: boolean) => {
      return new Promise<Position>((resolve, reject) => {
        Geolocation.getCurrentPosition(
          (position) => resolve(position),
          (error) => reject(error),
          {
            enableHighAccuracy: highAccuracy,
            timeout: highAccuracy ? 20000 : 10000,
            maximumAge: 10000,
          }
        );
      });
    };

    try {
      let position: Position;
      
      // 먼저 저정확도로 시도
      try {
        console.log('저정확도로 위치 조회 시도...');
        position = await getLocationWithAccuracy(false);
      } catch (lowAccError) {
        console.log('저정확도 실패, 고정확도로 재시도...');
        // 실패하면 고정확도로 재시도
        position = await getLocationWithAccuracy(true);
      }

      console.log('Location received:', position.coords);
      
      const location = isEmulatorLocation(position.coords.latitude, position.coords.longitude)
        ? DEFAULT_LOCATION
        : {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

      setCurrentLocation(location);
      setError(null);
      setIsLoading(false);
      fetchNearbyPharmacies(location);
      
    } catch (err: any) {
      console.log('Location error:', err);
      if (isEmulator) {
        console.log('Error occurred but running on emulator, using default location');
        setCurrentLocation(DEFAULT_LOCATION);
        setError(null);
        setIsLoading(false);
        fetchNearbyPharmacies(DEFAULT_LOCATION);
        return;
      }

      let errorMessage = '위치를 가져오는데 실패했습니다.';
      if (err.code === 1) {
        errorMessage = '위치 권한이 거부되었습니다. 설정에서 위치 권한을 허용해주세요.';
      } else if (err.code === 2) {
        errorMessage = 'GPS 신호가 약합니다. 하늘이 잘 보이는 곳으로 이동하거나, Wi-Fi를 켜주세요.';
      } else if (err.code === 3) {
        errorMessage = '위치 정보를 가져오는데 시간이 초과되었습니다. 다시 시도해주세요.';
      }

      // 안드로이드의 경우 Google Play Services 상태 확인
      if (Platform.OS === 'android') {
        try {
          const playServicesAvailable = await NativeModules.LocationModule.isGooglePlayServicesAvailable();
          if (!playServicesAvailable) {
            errorMessage = 'Google Play Services가 필요합니다. Play Store에서 업데이트해주세요.';
          }
        } catch (playError) {
          console.warn('Google Play Services 상태 확인 실패:', playError);
        }
      }

      setError(errorMessage);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 에뮬레이터인 경우 바로 기본 위치 사용
    if (isEmulator) {
      console.log('에뮬레이터 감지, 기본 위치 사용');
      setCurrentLocation(DEFAULT_LOCATION);
      setIsLoading(false);
      fetchNearbyPharmacies(DEFAULT_LOCATION);
      return;
    }

    // 실제 기기인 경우 현재 위치 가져오기
    getCurrentLocation();
  }, []);

  const fetchNearbyPharmacies = async (location: Location) => {
    console.log('Fetching nearby pharmacies for:', location);
    
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude},${location.longitude}&radius=${SEARCH_RADIUS}&type=pharmacy&key=${GOOGLE_MAPS_API_KEY}&language=ko`;
    
    console.log('Places API request URL:', url);

    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log('Places API raw response:', data);

      if (data.status === 'OK') {
        const results = data.results
          .map((item: any) => ({
            place_id: item.place_id,
            name: item.name,
            vicinity: item.vicinity,
            lat: item.geometry.location.lat,
            lng: item.geometry.location.lng,
            address: item.vicinity,
            phone: item.formatted_phone_number,
            rating: item.rating,
            opening_hours: item.opening_hours?.weekday_text || [],
            distance: getDistanceFromLatLonInKm(
              location.latitude,
              location.longitude,
              item.geometry.location.lat,
              item.geometry.location.lng
            ),
            isOpen: item.opening_hours?.some((day: string) => day.includes('Open'))
          }))
          .filter((item: Pharmacy) => item.distance && item.distance <= 3)
          .sort((a: Pharmacy, b: Pharmacy) => (a.distance || 0) - (b.distance || 0));

        console.log('Processed pharmacy results:', results);
        setPharmacies(results);
        
        // 지도에 마커 업데이트
        updateMapMarkers(results);

        if (results.length === 0) {
          setError('주변 3km 반경 내에 약국이 없습니다.');
        } else {
          setError(null);
        }
      } else {
        console.error('Places API error status:', data.status);
        console.error('Places API error message:', data.error_message);
        setError(`약국 검색 실패: ${data.status}`);
      }
    } catch (err) {
      console.error('약국 검색 실패:', err);
      setError('약국 검색 중 오류가 발생했습니다.');
    }
  };

  const searchPharmacies = async (searchText: string) => {
    try {
      // location 파라미터를 현재 위치로 설정하고, rankby=distance 대신 radius 사용
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchText + ' 약국')}&location=${currentLocation.latitude},${currentLocation.longitude}&radius=${SEARCH_RADIUS}&type=pharmacy&key=${GOOGLE_MAPS_API_KEY}&language=ko`;
      
      const response = await fetch(searchUrl);
      const data = await response.json();
      
      if (data.status === 'OK') {
        // 결과를 거리순으로 정렬
        const results = data.results
          .map((item: any) => ({
            place_id: item.place_id,
            name: item.name,
            vicinity: item.formatted_address,
            lat: item.geometry.location.lat,
            lng: item.geometry.location.lng,
            address: item.formatted_address,
            rating: item.rating,
            opening_hours: item.opening_hours?.weekday_text || [],
            // 현재 위치로부터의 거리 계산
            distance: getDistanceFromLatLonInKm(
              currentLocation.latitude,
              currentLocation.longitude,
              item.geometry.location.lat,
              item.geometry.location.lng
            ),
            isOpen: item.opening_hours?.some((day: string) => day.includes('Open'))
          }))
          .filter((item: Pharmacy) => item.distance && item.distance <= 3)
          .sort((a: Pharmacy, b: Pharmacy) => (a.distance || 0) - (b.distance || 0));

        setPharmacies(results);
        updateMapMarkers(results);

        // 검색 결과가 없을 경우 사용자에게 알림
        if (results.length === 0) {
          setError('3km 반경 내에 검색 결과가 없습니다.');
        } else {
          setError(null);
        }
      } else {
        console.error('Places API search error:', data.status);
        setError('검색 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('약국 검색 중 오류:', err);
      setError('검색 중 오류가 발생했습니다.');
    }
  };

  const updateMapMarkers = (pharmacies: Pharmacy[]) => {
    if (webViewRef.current) {
      const markersData = pharmacies.map(p => ({
        lat: p.lat,
        lng: p.lng,
        title: p.name,
        id: p.place_id,
        address: p.address || p.vicinity
      }));

      webViewRef.current.injectJavaScript(`
        try {
          // 기존 마커 제거
          if (window.markers && window.markers.length) {
            window.markers.forEach(marker => {
              if (marker && marker.setMap) {
                marker.setMap(null);
                if (marker.infowindow) {
                  marker.infowindow.close();
                }
              }
            });
          }
          window.markers = [];

          // 새 마커 추가
          const markersData = ${JSON.stringify(markersData)};
          markersData.forEach(data => {
            const marker = new google.maps.Marker({
              position: { lat: data.lat, lng: data.lng },
              map: map,
              title: data.title,
              pharmacyId: data.id,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: '#4285F4',  // 파란색으로 변경
                fillOpacity: 0.8,
                strokeColor: '#FFFFFF',
                strokeWeight: 2
              }
            });

            const infowindow = new google.maps.InfoWindow({
              content: '<div style="padding: 12px;">' +
                '<h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">' + data.title + '</h3>' +
                '<p style="margin: 0; color: #666; font-size: 14px;">' + data.address + '</p>' +
                '</div>'
            });

            marker.addListener('click', () => {
              window.markers.forEach(m => {
                if (m.infowindow) {
                  m.infowindow.close();
                }
              });
              infowindow.open(map, marker);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'MARKER_CLICKED',
                data: data.id
              }));
            });

            marker.infowindow = infowindow;
            window.markers.push(marker);
          });

          if (window.markers.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            window.markers.forEach(marker => {
              if (marker && marker.getPosition) {
                bounds.extend(marker.getPosition());
              }
            });
            map.fitBounds(bounds);
            if (map.getZoom() > 15) {
              map.setZoom(15);
            }
          }

          true;
        } catch (error) {
          console.error('Error updating markers:', error);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'ERROR',
            message: 'Error updating markers: ' + error.message
          }));
        }
      `);
    }
  };

  const handleMarkerClick = (pharmacyId: string) => {
    const pharmacy = pharmacies.find(p => p.place_id === pharmacyId);
    if (pharmacy) {
      setSelectedPharmacy(pharmacy);
      // 지도에서 해당 마커 포커싱
      webViewRef.current?.injectJavaScript(`
        try {
          const marker = markers.find(m => m.pharmacyId === '${pharmacyId}');
          if (marker) {
            // 다른 정보창들 닫기
            markers.forEach(m => m.infowindow?.close());
            // 선택된 마커의 정보창 열기
            marker.infowindow.open(map, marker);
            // 지도 중심 이동
            map.panTo({ lat: ${pharmacy.lat}, lng: ${pharmacy.lng} });
            map.setZoom(16);
          }
        } catch (error) {
          console.error('Error focusing marker:', error);
        }
        true;
      `);
    }
  };

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    try {
      const message: WebViewMessage = JSON.parse(event.nativeEvent.data);
      console.log('Received message from WebView:', message);
      
      switch (message.type) {
        case 'MAP_LOADED':
          console.log('Map loaded successfully');
          setIsLoading(false);
          // 지도가 로드되면 바로 약국 검색 실행
          if (currentLocation) {
            fetchNearbyPharmacies(currentLocation);
          }
          break;
        case 'MARKER_CLICKED':
          if (message.data) {
            handleMarkerClick(message.data);
          }
          break;
        case 'ERROR':
          console.error('Error from WebView:', message.message);
          setError(message.message || '지도 로드 중 오류가 발생했습니다.');
          break;
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (err) {
      console.error('Error parsing WebView message:', err);
    }
  };

  // 지도 포커싱 함수
  const focusMapOnPharmacy = (pharmacy: Pharmacy) => {
    const script = `
      const targetMarker = markers.find(marker => marker.getTitle() === "${pharmacy.name}");
      if (targetMarker) {
        map.setCenter(targetMarker.getPosition());
        map.setZoom(17);
        
        // 기존 선택된 마커 스타일 초기화
        markers.forEach(marker => {
          marker.setAnimation(null);
        });
        
        // 선택된 마커 바운스 애니메이션 적용
        targetMarker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(() => {
          targetMarker.setAnimation(null);
        }, 2100);
      }
    `;
    webViewRef.current?.injectJavaScript(script);
  };

  // 약국 목록 렌더링
  const renderPharmacyList = () => {
    return (
      <ScrollView style={styles.pharmacyListContainer}>
        {pharmacies.map((pharmacy, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.pharmacyItem,
              selectedPharmacy?.name === pharmacy.name && styles.selectedPharmacyItem
            ]}
            onPress={() => {
              setSelectedPharmacy(pharmacy);
              focusMapOnPharmacy(pharmacy);
            }}
          >
            <View style={styles.pharmacyInfo}>
              <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
              <Text style={styles.pharmacyAddress}>{pharmacy.address}</Text>
              {pharmacy.phone && (
                <Text style={styles.pharmacyPhone}>{pharmacy.phone}</Text>
              )}
            </View>
            <View style={styles.pharmacyStatus}>
              <Text style={[
                styles.statusText,
                { color: pharmacy.isOpen ? '#4CAF50' : '#F44336' }
              ]}>
                {pharmacy.isOpen ? '영업중' : '영업종료'}
              </Text>
              {pharmacy.distance && (
                <Text style={styles.distanceText}>{pharmacy.distance}km</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  // WebView HTML 수정 (마커 변수를 전역으로 저장)
  const getHtml = () => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          #map { height: 100vh; width: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          let map;
          let markers = []; // 마커 배열을 전역 변수로 저장

          function initMap() {
            const initialLocation = {
              lat: ${currentLocation?.latitude || DEFAULT_LOCATION.latitude},
              lng: ${currentLocation?.longitude || DEFAULT_LOCATION.longitude}
            };

            map = new google.maps.Map(document.getElementById('map'), {
              center: initialLocation,
              zoom: 15,
            });

            // 현재 위치 마커
            const currentMarker = new google.maps.Marker({
              position: initialLocation,
              map: map,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
              },
              title: '현재 위치'
            });

            // 약국 마커 추가
            ${pharmacies.map((pharmacy) => `
              const marker = new google.maps.Marker({
                position: { lat: ${pharmacy.lat}, lng: ${pharmacy.lng} },
                map: map,
                icon: {
                  url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                },
                title: '${pharmacy.name}'
              });
              markers.push(marker);
            `).join('')}
          }
        </script>
        <script async defer
          src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap">
        </script>
      </body>
    </html>
  `;

  // 재시도 버튼 클릭 핸들러
  const handleRetry = () => {
    getCurrentLocation();  // 위치 권한부터 다시 확인
  };

  // 검색어에 따른 약국 필터링
  const filteredPharmacies = searchText
    ? pharmacies.filter(pharmacy => 
        pharmacy.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (pharmacy.address || pharmacy.vicinity).toLowerCase().includes(searchText.toLowerCase())
      )
    : pharmacies;

  // 두 지점 간의 거리를 계산하는 함수 (km 단위)
  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // 지구의 반경 (km)
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // 거리 (km)
    return d;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI/180);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3478f6" />
        <Text style={styles.loadingText}>위치 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (!currentLocation || error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || '위치를 찾을 수 없습니다.'}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={handleRetry}
        >
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
        {!hasLocationPermission && Platform.OS === 'android' && (
          <TouchableOpacity 
            style={[styles.retryButton, { marginTop: 10, backgroundColor: '#666' }]}
            onPress={() => {
              Linking.openSettings();
            }}
          >
            <Text style={styles.retryButtonText}>위치 권한 설정</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>약국 찾기</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchBar}
            placeholder="약국명 또는 주소 검색"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={() => {
              if (searchText.trim()) {
                searchPharmacies(searchText.trim());
              } else {
                fetchNearbyPharmacies(currentLocation);
              }
            }}
            returnKeyType="search"
            placeholderTextColor="#666"
          />
          {searchText.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => {
                setSearchText('');
                fetchNearbyPharmacies(currentLocation);
              }}
            >
              <Text>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: getHtml() }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          geolocationEnabled={true}
          androidLayerType="hardware"
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error:', nativeEvent);
            setError('지도 로드 중 오류가 발생했습니다.');
          }}
          onMessage={handleWebViewMessage}
          onLoadEnd={() => {
            console.log('WebView loaded');
          }}
        />
      </View>

      {filteredPharmacies.length > 0 ? (
        renderPharmacyList()
      ) : (
        <View style={styles.noResultContainer}>
          <Text style={styles.noResult}>주변 약국을 검색중입니다...</Text>
        </View>
      )}

      {selectedPharmacy && (
        <View style={styles.selectedPharmacy}>
          <View style={styles.selectedPharmacyHeader}>
            <View>
              <Text style={styles.selectedPharmacyName}>{selectedPharmacy.name}</Text>
              <Text style={styles.selectedPharmacyAddress}>
                {selectedPharmacy.address || selectedPharmacy.vicinity}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setSelectedPharmacy(null)}
            >
              <Text>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.buttonContainer}>
            {selectedPharmacy.phone && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  if (selectedPharmacy.phone) {
                    const phoneNumber = selectedPharmacy.phone.replace(/\D/g, '');
                    Linking.openURL(`tel:${phoneNumber}`);
                  }
                }}
              >
                <Text style={styles.actionButtonText}>전화하기</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                const { lat, lng } = selectedPharmacy;
                const url = Platform.select({
                  ios: `maps://app?daddr=${lat},${lng}`,
                  android: `google.navigation:q=${lat},${lng}`
                });
                if (url) Linking.openURL(url);
              }}
            >
              <Text style={styles.actionButtonText}>길찾기</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 12,
    color: '#333',
  },
  searchContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    height: 44,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  clearButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  mapContainer: {
    height: Dimensions.get('window').height * 0.4,
    backgroundColor: '#eaeaea',
  },
  map: { 
    flex: 1,
  },
  pharmacyListContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pharmacyItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  selectedPharmacyItem: {
    backgroundColor: '#f0f7ff',
  },
  pharmacyName: { 
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  pharmacyAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  pharmacyPhone: {
    fontSize: 14,
    color: '#666',
  },
  noResultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noResult: { 
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  selectedPharmacy: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  selectedPharmacyName: { 
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  selectedPharmacyAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  selectedPharmacyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pharmacyInfo: {
    flex: 1,
  },
  pharmacyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
  },
});

export default PharmacyMapScreen;