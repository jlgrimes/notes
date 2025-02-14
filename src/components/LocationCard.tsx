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
  placeId?: string;
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
    const { placeId, coordinates, name, address } = location;

    // For iOS (Apple Maps)
    if (Platform.OS === 'ios') {
      // Construct a more precise query for Apple Maps
      let url = 'maps://';

      if (coordinates?.latitude && coordinates?.longitude) {
        // If we have coordinates, use them as the center point
        url += `?ll=${coordinates.latitude},${coordinates.longitude}`;
        // Add the name as a marker at those coordinates
        if (name) {
          url += `&q=${encodeURIComponent(name)}`;
        }
      } else if (address) {
        // If we have a full address, use it for more precise location
        url += `?address=${encodeURIComponent(address)}`;
        // Add the name as the marker label
        if (name && name !== address) {
          url += `&q=${encodeURIComponent(name)}`;
        }
      } else {
        // Fallback to just searching by name
        url += `?q=${encodeURIComponent(name)}`;
      }

      // Add directionsfrom=current%20location if you want to start navigation immediately
      // url += '&directionsfrom=current%20location';

      Linking.openURL(url);
      return;
    }

    // For Android (Google Maps)
    if (Platform.OS === 'android') {
      if (placeId) {
        const url = `google.navigation:q=${encodeURIComponent(name)}`;
        Linking.openURL(url);
      } else if (coordinates?.latitude && coordinates?.longitude) {
        const url = `google.navigation:q=${coordinates.latitude},${coordinates.longitude}`;
        Linking.openURL(url);
      } else {
        const query = address || name;
        const url = `google.navigation:q=${encodeURIComponent(query)}`;
        Linking.openURL(url);
      }
      return;
    }

    // For web browsers
    if (placeId) {
      Linking.openURL(
        `https://www.google.com/maps/place/?q=place_id:${placeId}`
      );
    } else if (coordinates?.latitude && coordinates?.longitude) {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`
      );
    } else {
      const query = address || name;
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          query
        )}`
      );
    }
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
