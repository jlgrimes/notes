import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

interface SettingsScreenProps {
  signOut: () => void;
}

export function SettingsScreen({ signOut }: SettingsScreenProps) {
  const { session } = useAuth();
  const userEmail = session?.user?.email;
  const userName = session?.user?.user_metadata?.full_name || 'User';
  const userAvatar = session?.user?.user_metadata?.avatar_url;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.settingsContainer}>
        <Text style={styles.settingsTitle}>Settings</Text>

        <View style={styles.profileCard}>
          {userAvatar ? (
            <Image source={{ uri: userAvatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>
        </View>

        <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  settingsContainer: {
    padding: 20,
  },
  settingsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6B7280',
  },
  signOutButton: {
    backgroundColor: '#EF4444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
