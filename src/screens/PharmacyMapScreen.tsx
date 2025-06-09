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
  NativeModules
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
  return latDiff < 1 && lngDiff < 1; // 위치 1도 이내의 차이는 에뮬레이터로 간주
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
  const webViewRef = useRef<WebView>(null);

  // 검색 반경 상수 정의 (미터 단위)
  const SEARCH_RADIUS = 3000; // 3km

  const getCurrentLocation = () => {
    console.log('Getting current location...');
    console.log('Is Emulator:', isEmulator);
    
    Geolocation.getCurrentPosition(
      (position) => {
        console.log('Location received:', position.coords);
        
        if (isEmulatorLocation(position.coords.latitude, position.coords.longitude)) {
          console.log('Emulator default location detected, using custom default location');
          setCurrentLocation(DEFAULT_LOCATION);
        } else {
          console.log('Using actual device location');
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        }
        setError(null);
        setIsLoading(false);
      },
      (err: GeolocationError) => {
        console.log('Location error:', err);
        if (isEmulator) {
          console.log('Error occurred but running on emulator, using default location');
          setCurrentLocation(DEFAULT_LOCATION);
          setError(null);
          setIsLoading(false);
          return;
        }
        let errorMessage = '위치를 가져오는데 실패했습니다.';
        switch (err.code) {
          case 1:
            errorMessage = '위치 권한이 거부되었습니다.';
            break;
          case 2:
            errorMessage = '위치를 확인할 수 없습니다. GPS가 켜져있는지 확인해주세요.';
            break;
          case 3:
            errorMessage = '위치 정보를 가져오는데 시간이 초과되었습니다.';
            break;
        }
        setError(errorMessage);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
      }
    );
  };

  useEffect(() => {
    // 에뮬레이터인 경우 바로 기본 위치 사용
    if (isEmulator) {
      console.log('에뮬레이터 감지, 기본 위치 사용');
      setCurrentLocation(DEFAULT_LOCATION);
      setIsLoading(false);
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
            )
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
            )
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
          markers.forEach(marker => marker.setMap(null));
          markers = [];

          // 새 마커 추가
          ${JSON.stringify(markersData)}.forEach(data => {
            const marker = new google.maps.Marker({
              position: { lat: data.lat, lng: data.lng },
              map: map,
              title: data.title,
              pharmacyId: data.id,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: '#4285F4',
                fillOpacity: 0.8,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
                strokeOpacity: 1,
              }
            });

            const infowindow = new google.maps.InfoWindow({
              content: '<div style="padding: 12px;">' +
                '<h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">' + data.title + '</h3>' +
                '<p style="margin: 0; color: #666; font-size: 14px;">' + data.address + '</p>' +
                '</div>'
            });

            marker.addListener('click', () => {
              markers.forEach(m => m.infowindow?.close());
              infowindow.open(map, marker);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'MARKER_CLICKED',
                data: data.id
              }));
            });

            marker.infowindow = infowindow;
            markers.push(marker);
          });

          if (markers.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            markers.forEach(marker => bounds.extend(marker.getPosition()));
            map.fitBounds(bounds);
            if (map.getZoom() > 15) map.setZoom(15);
          }
        } catch (error) {
          console.error('Error updating markers:', error);
        }
        true;
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

  const mapHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          html, body { 
            margin: 0; 
            padding: 0; 
            height: 100%; 
            width: 100%; 
          }
          #map { 
            width: 100%; 
            height: 100%; 
            position: absolute; 
            top: 0; 
            left: 0; 
            background-color: #f0f0f0;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          let map;
          let markers = [];

          function initMap() {
            try {
            const currentLocation = {
              lat: ${currentLocation.latitude},
              lng: ${currentLocation.longitude}
            };
            
              console.log('Initializing map with location:', currentLocation);
              
              map = new google.maps.Map(document.getElementById('map'), {
              center: currentLocation,
                zoom: 15,
                mapTypeControl: false,
                fullscreenControl: false,
                streetViewControl: false,
                zoomControl: true
              });

              // 현재 위치 마커 (빨간색)
              const currentLocationMarker = new google.maps.Marker({
              position: currentLocation,
              map: map,
                title: '현재 위치',
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: '#EA4335',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                }
              });

              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'MAP_LOADED',
                message: 'Map initialized successfully'
              }));

            } catch (error) {
              console.error('Error in initMap:', error);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'ERROR',
                message: 'Map initialization failed: ' + error.message
              }));
            }
          }

          window.onerror = function(msg, url, line) {
            console.error('JavaScript error:', msg, 'at', url, ':', line);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'ERROR',
              message: 'JavaScript error: ' + msg
            }));
            return false;
          };
        </script>
        <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap" async defer></script>
      </body>
    </html>
  `;

  useEffect(() => {
    if (currentLocation) {
      console.log('Current location updated, fetching pharmacies...', currentLocation);
      fetchNearbyPharmacies(currentLocation);
    }
  }, [currentLocation]);

  // 재시도 버튼 클릭 핸들러
  const handleRetry = () => {
    if (currentLocation) {
      fetchNearbyPharmacies(currentLocation);
    }
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

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={handleRetry}
        >
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentLocation) {
    return (
      <View style={styles.container}>
        <Text>위치를 찾을 수 없습니다.</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => {
            if (currentLocation) {
              fetchNearbyPharmacies(currentLocation);
            }
          }}
        >
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
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
        source={{ html: mapHTML }}
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
        <FlatList
          data={filteredPharmacies}
          keyExtractor={(item) => item.place_id}
          style={styles.pharmacyList}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.pharmacyItem,
                selectedPharmacy?.place_id === item.place_id && styles.selectedItem
              ]} 
              onPress={() => handleMarkerClick(item.place_id)}
            >
              <View style={styles.pharmacyInfo}>
                <Text style={styles.pharmacyName}>{item.name}</Text>
                <Text style={styles.pharmacyAddress}>{item.address || item.vicinity}</Text>
                {item.phone && (
                  <Text style={styles.pharmacyPhone}>{item.phone}</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
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
  pharmacyList: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pharmacyItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  selectedItem: {
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
});

export default PharmacyMapScreen;