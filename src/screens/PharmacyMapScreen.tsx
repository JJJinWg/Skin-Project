import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GOOGLE_PLACES_API_KEY } from '@env';

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
}

const PharmacyMapScreen = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [searchText, setSearchText] = useState('');

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const fetchNearbyPharmacies = async (lat: number, lng: number) => {
    const apiKey = GOOGLE_PLACES_API_KEY;
    const radius = 2000;
    const type = 'pharmacy';

    try {
      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
        {
          params: {
            location: `${lat},${lng}`,
            radius,
            type,
            key: apiKey,
            language: 'ko',
          },
        },
      );

      const results = response.data.results.map((item: any) => ({
        place_id: item.place_id,
        name: item.name,
        vicinity: item.vicinity,
        lat: item.geometry.location.lat,
        lng: item.geometry.location.lng,
        address: item.vicinity,
        phone: item.formatted_phone_number,
        rating: item.rating,
        opening_hours: item.opening_hours?.weekday_text || [],
      }));

      setPharmacies(results);
    } catch (err) {
      console.error('약국 검색 실패:', err);
    }
  };

  useEffect(() => {
    const fetchLocation = async () => {
      const granted = await requestLocationPermission();
      if (!granted) {
        return; // 중괄호 추가로 eslint(curly) 오류 해결
      }

      Geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation({ latitude, longitude });
          setMapRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
          fetchNearbyPharmacies(latitude, longitude);
        },
        (err) => console.warn(err.message),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    };

    fetchLocation();
  }, []);

  const handlePharmacyPress = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setMapRegion({
      latitude: pharmacy.lat,
      longitude: pharmacy.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const handleSendPrescription = () => {
    Alert.alert('처방전 전송 완료', '약국으로 처방전이 전송되었습니다.');
    setSelectedPharmacy(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🧭 약국 찾기</Text>
      <TextInput
        style={styles.searchBar}
        placeholder="약국명 또는 주소 검색"
        value={searchText}
        onChangeText={setSearchText}
      />

      <View style={styles.mapContainer}>
        {mapRegion && (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={mapRegion}
            showsUserLocation
            zoomEnabled
            scrollEnabled
          >
            {location && (
              <Marker
                coordinate={location}
                title="현재 위치"
                pinColor="blue"
              />
            )}
            {pharmacies.map((p) => (
              <Marker
                key={p.place_id}
                coordinate={{ latitude: p.lat, longitude: p.lng }}
                title={p.name}
                description={p.vicinity}
              />
            ))}
          </MapView>
        )}
      </View>

      <FlatList
        data={pharmacies}
        keyExtractor={(item) => item.place_id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePharmacyPress(item)}>
            <View style={styles.pharmacyItem}>
              <Text style={styles.pharmacyName}>{item.name}</Text>
              <Text style={styles.pharmacyVicinity}>{item.vicinity}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.noResult}>0개의 약국이 검색되었습니다</Text>}
      />

      {selectedPharmacy && (
        <View style={styles.selectedPharmacy}>
          <Text style={styles.selectedPharmacyName}>{selectedPharmacy.name}</Text>
          <Text style={styles.selectedPharmacyVicinity}>{selectedPharmacy.vicinity}</Text>
          <TouchableOpacity style={styles.sendButton} onPress={handleSendPrescription}>
            <Text style={styles.sendButtonText}>처방전 보내기</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 12 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  mapContainer: {
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#eaeaea',
    marginBottom: 10,
  },
  map: { flex: 1 },
  pharmacyItem: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pharmacyName: { fontWeight: '600', fontSize: 14 },
  pharmacyVicinity: { color: '#666', fontSize: 12 },
  noResult: { textAlign: 'center', color: '#888', marginTop: 10 },
  selectedPharmacy: {
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingTop: 10,
    backgroundColor: '#fff',
  },
  selectedPharmacyName: { fontWeight: 'bold', fontSize: 16, marginBottom: 2 },
  selectedPharmacyVicinity: { fontSize: 12, color: '#444', marginBottom: 10 },
  sendButton: {
    backgroundColor: '#3478f6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default PharmacyMapScreen;
