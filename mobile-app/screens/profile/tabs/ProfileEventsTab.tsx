import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { userService } from '../../../services/userService';
import { EventCard } from '../../../components/events/EventCard';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../../../types';
import { colors, spacing, typography } from '../../../constants/theme';
import { useRouter } from 'expo-router';
import EventTicketsScreen from './EventTicketsScreen';

function ProfileEventsTab() {
  const { user } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!user?.id) return;
    try {
      // Get user's tickets first
      const tickets = await userService.getTickets(user.id);
      
      // Extract unique event IDs from tickets
      const eventIds = [...new Set(tickets.map(t => t.event_id).filter(Boolean))];
      
      if (eventIds.length > 0) {
        // Fetch each event
        const eventService = await import('../../../services/eventService');
        const eventPromises = eventIds.map(id => eventService.eventService.getEvent(id));
        const fetchedEvents = await Promise.all(eventPromises);
        setEvents(fetchedEvents.filter(Boolean));
      } else {
        setEvents([]);
      }
    } catch (error: any) {
      console.error('Error loading events:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to load events');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const handleEventPress = (eventId: number) => {
    router.push(`/event/${eventId}` as any);
  };

  const handleViewTickets = (eventId: number) => {
    setSelectedEventId(eventId);
  };

  const handleBackToEvents = () => {
    setSelectedEventId(null);
  };

  // If an event is selected, show EventTicketsScreen
  if (selectedEventId) {
    return (
      <EventTicketsScreen
        eventId={selectedEventId}
        onBack={handleBackToEvents}
      />
    );
  }

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
        <View style={styles.eventContainer}>
          <EventCard event={item} onPress={() => handleEventPress(item.id)} />
          <TouchableOpacity 
            style={styles.viewTicketsButton}
            onPress={() => handleViewTickets(item.id)}
          >
            <Ionicons name="ticket" size={16} color={colors.primary} />
            <Text style={styles.viewTicketsText}>View Tickets</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
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
  eventContainer: {
    marginBottom: spacing.md,
  },
  viewTicketsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.cardBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginTop: spacing.sm,
  },
  viewTicketsText: {
    fontSize: typography.small.fontSize,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default ProfileEventsTab;
