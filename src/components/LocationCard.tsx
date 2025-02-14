import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  Linking,
  Platform,
  View,
} from 'react-native';

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
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.locationName}>{location.name}</Text>
          {location.address && (
            <Text style={styles.locationAddress}>{location.address}</Text>
          )}
        </View>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📍</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 6,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: Platform.OS === 'ios' ? 0 : 1,
    borderColor: '#E5E7EB',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  iconContainer: {
    marginLeft: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#6B7280',
  },
  icon: {
    fontSize: 18,
  },
});
