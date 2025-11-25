import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../../types';
import { Card } from '../ui/Card';
import { colors, spacing, typography } from '../../constants/theme';

interface EventCardProps {
  event: Event;
  onPress: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress }) => {
  const startDate = new Date(event.start_datetime);
  const isUpcoming = startDate > new Date();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {event.title}
          </Text>
          {!isUpcoming && <View style={styles.pastBadge}>
            <Text style={styles.pastText}>Past</Text>
          </View>}
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color={colors.primary} />
          <Text style={styles.infoText}>
            {formatDate(startDate)} at {formatTime(startDate)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color={colors.primary} />
          <Text style={styles.infoText} numberOfLines={1}>
            {event.location}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.ticketInfo}>
            <Ionicons name="ticket-outline" size={16} color={colors.success} />
            <Text style={styles.availableText}>
              {event.available_tickets} / {event.total_tickets} available
            </Text>
          </View>
          {event.available_tickets === 0 && (
            <View style={styles.soldOutBadge}>
              <Text style={styles.soldOutText}>Sold Out</Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  pastBadge: {
    backgroundColor: colors.textSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pastText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginLeft: spacing.sm,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  ticketInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availableText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  soldOutBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  soldOutText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
