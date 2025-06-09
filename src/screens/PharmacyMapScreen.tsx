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
  ActivityIndicator
} from 'react-native';
import { WebView } from 'react-native-webview';
import Geolocation, { GeolocationError } from '@react-native-community/geolocation';
import { SafeAreaView } from 'react-native-safe-area-context';
import DeviceInfo from 'react-native-device-info';

const GOOGLE_MAPS_API_KEY = 'AIzaSyA56Pzyczr7ZJyDOh_0Gk54EfdPiyxL5eU';

// 아산 탕정면 기본 위치
const DEFAULT_LOCATION = {
  latitude: 36.7947,  // 아산 탕정면 위도
  longitude: 127.0872 // 아산 탕정면 경도
};

interface Location {
  latitude: number;
  longitude: number;
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
  geometry: {
    location: {
      lat: number;
      lng: number;
    }
  };
}

const PharmacyMapScreen = () => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [isEmulator, setIsEmulator] = useState(false);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    const checkEmulator = async () => {
      try {
        const isEmu = await DeviceInfo.isEmulator();
        console.log('Is emulator:', isEmu);
        setIsEmulator(isEmu);
        requestAndGetLocation();
      } catch (err) {
        console.error('Error checking emulator:', err);
        requestAndGetLocation();
      }
    };
    checkEmulator();
  }, []);

  const requestAndGetLocation = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: '위치 권한',
            message: '주변 약국을 찾기 위해 위치 권한이 필요합니다.',
            buttonNeutral: '나중에',
            buttonNegative: '거부',
            buttonPositive: '허용',
          }
        );
        
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permission denied');
          Alert.alert('권한 필요', '위치 정보 사용을 위해 권한이 필요합니다.');
          setError('위치 권한이 거부되었습니다.');
          setIsLoading(false);
          return;
        }
        getCurrentLocation();
      } catch (err) {
        console.warn('Permission request error:', err);
        Alert.alert('오류', '권한 요청 중 문제가 발생했습니다.');
        setError('위치 권한 요청 중 오류가 발생했습니다.');
        setIsLoading(false);
      }
    } else {
      Geolocation.requestAuthorization();
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    console.log('Getting current location... Is Emulator:', isEmulator);
    if (isEmulator) {
      console.log('Using default location for emulator');
      setCurrentLocation(DEFAULT_LOCATION);
      setError(null);
      setIsLoading(false);
      return;
    }

    Geolocation.getCurrentPosition(
      (position: Position) => {
        console.log('Location success:', position);
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
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
    console.log('PharmacyMapScreen mounted');
    requestAndGetLocation();
  }, []);

  const handlePharmacyPress = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    webViewRef.current?.injectJavaScript(`
      if (map) {
        map.setCenter({
          lat: ${pharmacy.geometry.location.lat},
          lng: ${pharmacy.geometry.location.lng}
        });
        map.setZoom(17);
      }
      true;
    `);
  };

  const handleSendPrescription = () => {
    Alert.alert('처방전 전송 완료', '약국으로 처방전이 전송되었습니다.');
    setSelectedPharmacy(null);
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
        <Text style={styles.errorTitle}>오류 발생</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={requestAndGetLocation}
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
          onPress={requestAndGetLocation}
        >
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          }
        </style>
        <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places"></script>
        <script>
          let map;
          let service;
          let markers = [];

          function initMap() {
            try {
              console.log('Initializing map...');
              const currentLocation = {
                lat: ${currentLocation?.latitude || DEFAULT_LOCATION.latitude},
                lng: ${currentLocation?.longitude || DEFAULT_LOCATION.longitude}
              };
              
              map = new google.maps.Map(document.getElementById('map'), {
                center: currentLocation,
                zoom: 15,
                mapTypeControl: false,
                fullscreenControl: false,
                streetViewControl: false
              });

              // 현재 위치 마커 (파란색)
              new google.maps.Marker({
                position: currentLocation,
                map: map,
                title: '현재 위치',
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: '#4285F4',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                }
              });

              // 주변 약국 검색
              const request = {
                location: currentLocation,
                radius: 2000,
                type: ['pharmacy']
              };

              service = new google.maps.places.PlacesService(map);
              service.nearbySearch(request, (results, status) => {
                console.log('Places search status:', status);
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                  console.log('Found places:', results.length);
                  window.ReactNativeWebView.postMessage(JSON.stringify(results));
                  results.forEach(place => {
                    if (place.geometry && place.geometry.location) {
                      const marker = new google.maps.Marker({
                        position: place.geometry.location,
                        map: map,
                        title: place.name,
                        icon: {
                          path: google.maps.SymbolPath.CIRCLE,
                          scale: 10,
                          fillColor: '#EA4335',
                          fillOpacity: 1,
                          strokeColor: '#ffffff',
                          strokeWeight: 2,
                        }
                      });
                      markers.push(marker);
                    }
                  });
                } else {
                  console.error('Places search failed:', status);
                }
              });

              window.map = map;
            } catch (error) {
              console.error('Error in initMap:', error);
            }
          }

          window.onerror = function(msg, url, line) {
            console.error('JavaScript error:', msg, 'at', url, ':', line);
            return false;
          };
        </script>
      </head>
      <body onload="initMap()">
        <div id="map"></div>
      </body>
    </html>
  `;

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
            placeholderTextColor="#666"
          />
          {searchText.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSearchText('')}
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
          }}
          onMessage={(event) => {
            const pharmacyData = JSON.parse(event.nativeEvent.data);
            setPharmacies(pharmacyData);
          }}
        />
      </View>

      {pharmacies.length > 0 ? (
        <FlatList
          data={pharmacies}
          keyExtractor={(item) => item.place_id}
          style={styles.pharmacyList}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.pharmacyItem,
                selectedPharmacy?.place_id === item.place_id && styles.selectedItem
              ]} 
              onPress={() => handlePharmacyPress(item)}
            >
              <Text style={styles.pharmacyName}>{item.name}</Text>
              <Text style={styles.pharmacyVicinity}>{item.vicinity}</Text>
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
          <Text style={styles.selectedPharmacyName}>{selectedPharmacy.name}</Text>
          <Text style={styles.selectedPharmacyVicinity}>{selectedPharmacy.vicinity}</Text>
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={handleSendPrescription}
          >
            <Text style={styles.sendButtonText}>처방전 보내기</Text>
          </TouchableOpacity>
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
  pharmacyVicinity: { 
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
  selectedPharmacyVicinity: { 
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  sendButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
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
});

export default PharmacyMapScreen;