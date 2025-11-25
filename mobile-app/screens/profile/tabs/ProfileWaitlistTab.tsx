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
import { userService } from '../../../services/userService';
import { Card } from '../../../components/ui/Card';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';
import { WaitlistEntry } from '../../../types';
import { colors, spacing, typography } from '../../../constants/theme';

function ProfileWaitlistTab() {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWaitlist = useCallback(async () => {
    try {
      const data = await userService.getWaitlist();
      setWaitlist(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load waitlist');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchWaitlist();
  }, [fetchWaitlist]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWaitlist();
  };

  const handleLeave = async (entryId: number) => {
    Alert.alert(
      'Leave Waitlist',
      'Are you sure you want to leave this waitlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.leaveWaitlist(entryId);
              Alert.alert('Success', 'Left waitlist successfully');
              fetchWaitlist();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to leave waitlist');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (waitlist.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="time-outline" size={64} color={colors.textSecondary} />
        <Text style={styles.emptyText}>No waitlist entries</Text>
        <Text style={styles.emptySubtext}>
          Join a waitlist when an event is sold out
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={waitlist}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <Card style={styles.card}>
          <View style={styles.header}>
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>{item.event_title}</Text>
              <Text style={styles.ticketType}>{item.ticket_type_name}</Text>
            </View>
            <View style={styles.positionBadge}>
              <Text style={styles.positionText}>#{item.position}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>Joined {formatDate(item.created_at)}</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.leaveButton}
              onPress={() => handleLeave(item.id)}
            >
              <Text style={styles.leaveButtonText}>Leave Waitlist</Text>
            </TouchableOpacity>
          </View>
        </Card>
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
  card: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  ticketType: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  positionBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  positionText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  actions: {
    marginTop: spacing.sm,
  },
  leaveButton: {
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
    alignItems: 'center',
  },
  leaveButtonText: {
    color: colors.error,
    fontWeight: '600',
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

export default ProfileWaitlistTab;
