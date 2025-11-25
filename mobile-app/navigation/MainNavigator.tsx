import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EventListScreen from '../screens/events/EventListScreen';
import EventDetailScreen from '../screens/events/EventDetailScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { colors } from '../constants/theme';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();

function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="EventList"
        component={EventListScreen}
        options={({ navigation }) => ({
          title: 'Events',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              style={styles.headerButton}
            >
              <Ionicons name="person-outline" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{
          title: 'Event Details',
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    padding: 8,
  },
});

export default MainNavigator;
