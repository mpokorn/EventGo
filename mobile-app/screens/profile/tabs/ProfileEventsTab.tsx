import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { userService } from '../../../services/userService';
import { EventCard } from '../../../components/events/EventCard';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../../../types';
import { colors, spacing, typography } from '../../../constants/theme';

function ProfileEventsTab({ navigation }: any) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const data = await userService.getUserEvents();
      setEvents(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load events');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const handleEventPress = (eventId: number) => {
    navigation.navigate('EventDetail', { eventId });
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={64} color={colors.textSecondary} />
        <Text style={styles.emptyText}>No events attended</Text>
        <Text style={styles.emptySubtext}>
          Events you have tickets for will appear here
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <EventCard event={item} onPress={() => handleEventPress(item.id)} />
      )}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default ProfileEventsTab;
