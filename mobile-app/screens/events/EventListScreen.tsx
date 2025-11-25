import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput as RNTextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { eventService } from '../../services/eventService';
import { Event } from '../../types';
import { EventCard } from '../../components/events/EventCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { colors, spacing, typography } from '../../constants/theme';

export default function EventListScreen({ navigation }: any) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const loadEvents = useCallback(async () => {
    try {
      setError('');
      const data = await eventService.getEvents({
        search: searchQuery || undefined,
      });
      setEvents(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load events');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (!loading) {
        loadEvents();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  const handleEventPress = (event: Event) => {
    navigation.navigate('EventDetail', { eventId: event.id });
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading events..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover Events</Text>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <RNTextInput
            style={styles.searchInput}
            placeholder="Search events or locations..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.textSecondary}
              style={styles.clearIcon}
              onPress={() => setSearchQuery('')}
            />
          )}
        </View>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <EventCard event={item} onPress={() => handleEventPress(item)} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No events found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery
                ? 'Try a different search term'
                : 'Check back later for new events'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    paddingVertical: spacing.sm + 4,
  },
  clearIcon: {
    marginLeft: spacing.sm,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  errorContainer: {
    margin: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.error + '20',
    borderRadius: 8,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  emptySubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.xs,
  },
});
