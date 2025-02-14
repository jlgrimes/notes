import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  Linking,
  Platform,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface LocationReference {
  name: string;
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface LocationCardProps {
  location: LocationReference;
}

export function LocationCard({ location }: LocationCardProps) {
  const handlePress = () => {
    const query = location.address || location.name;
    const coords = location.coordinates;

    let url: string;
    if (Platform.OS === 'ios') {
      // Use coordinates if available, otherwise use address/name
      url = coords
        ? `maps://maps.apple.com/?ll=${coords.latitude},${
            coords.longitude
          }&q=${encodeURIComponent(location.name)}`
        : `maps://maps.apple.com/?q=${encodeURIComponent(query)}`;
    } else if (Platform.OS === 'android') {
      // Use coordinates if available, otherwise use address/name
      url = coords
        ? `geo:${coords.latitude},${coords.longitude}?q=${encodeURIComponent(
            location.name
          )}`
        : `geo:0,0?q=${encodeURIComponent(query)}`;
    } else {
      // Web fallback - Google Maps
      url = coords
        ? `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            query
          )}`;
    }

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Fallback to Google Maps web
        const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          query
        )}`;
        Linking.openURL(fallbackUrl);
      }
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View>
          <Text style={styles.locationName}>📍 {location.name}</Text>
          {location.address && (
            <Text style={styles.locationAddress}>{location.address}</Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 4,
  },
  gradient: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  locationName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  locationAddress: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.9,
    marginTop: 2,
  },
});
