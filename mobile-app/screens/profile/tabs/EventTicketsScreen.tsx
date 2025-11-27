import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { userService } from '../../../services/userService';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { TicketCard } from '../../../components/tickets/TicketCard';
import { Ionicons } from '@expo/vector-icons';
import { Ticket, Event } from '../../../types';
import { colors, spacing, typography } from '../../../constants/theme';
import { useRouter } from 'expo-router';

interface EventTicketsScreenProps {
  eventId: number;
  onBack: () => void;
}

export function EventTicketsScreen({ eventId, onBack }: EventTicketsScreenProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [eventId]);

  const fetchTickets = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await userService.getEventTickets(user.id, eventId);
      setEvent(response.event);
      setTickets(response.tickets || []);
      setError('');
    } catch (err: any) {
      console.error('Error fetching tickets:', err);
      setError(err.response?.data?.message || 'Failed to load tickets.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewEvent = () => {
    router.push(`/event/${eventId}`);
  };

  // Group tickets by status
  const reservedTickets = tickets.filter((t) => t.status === 'reserved');
  const activeTickets = tickets.filter((t) => t.status === 'active');
  const pendingReturnTickets = tickets.filter((t) => t.status === 'pending_return');
  const refundedTickets = tickets.filter((t) => t.status === 'refunded');

  if (loading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
            <Text style={styles.backButtonText}>Back to My Events</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
          <Text style={styles.backButtonText}>Back to My Events</Text>
        </TouchableOpacity>

        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{event?.title}</Text>
          <View style={styles.eventDetails}>
            <View style={styles.eventDetailRow}>
              <Ionicons name="calendar" size={16} color={colors.textSecondary} />
              <Text style={styles.eventDetailText}>
                {event?.start_datetime
                  ? new Date(event.start_datetime).toLocaleString()
                  : 'N/A'}
              </Text>
            </View>
            <View style={styles.eventDetailRow}>
              <Ionicons name="location" size={16} color={colors.textSecondary} />
              <Text style={styles.eventDetailText}>{event?.location || 'N/A'}</Text>
            </View>
            <View style={styles.eventDetailRow}>
              <Ionicons name="ticket" size={16} color={colors.textSecondary} />
              <Text style={styles.eventDetailText}>
                Total Tickets: {tickets.length}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.viewEventButton} onPress={handleViewEvent}>
          <Text style={styles.viewEventButtonText}>View Event Page</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {tickets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="ticket-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No tickets found for this event</Text>
        </View>
      ) : (
        <View style={styles.ticketsContainer}>
          {/* RESERVED TICKETS */}
          {reservedTickets.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="gift" size={20} color={colors.success} />
                <Text style={styles.sectionTitle}>Reserved Tickets</Text>
              </View>
              {reservedTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onAccept={undefined}
                  onDecline={undefined}
                  onRefund={undefined}
                />
              ))}
            </View>
          )}

          {/* ACTIVE TICKETS */}
          {activeTickets.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>Active Tickets</Text>
              </View>
              {activeTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onAccept={undefined}
                  onDecline={undefined}
                  onRefund={undefined}
                />
              ))}
            </View>
          )}

          {/* PENDING RETURN TICKETS */}
          {pendingReturnTickets.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="time" size={20} color={colors.warning} />
                <Text style={styles.sectionTitle}>Pending Return</Text>
              </View>
              {pendingReturnTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onAccept={undefined}
                  onDecline={undefined}
                  onRefund={undefined}
                />
              ))}
            </View>
          )}

          {/* REFUNDED TICKETS */}
          {refundedTickets.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="checkmark-done-circle" size={20} color={colors.success} />
                <Text style={styles.sectionTitle}>Successfully Refunded</Text>
              </View>
              {refundedTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onAccept={undefined}
                  onDecline={undefined}
                  onRefund={undefined}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  backButtonText: {
    fontSize: typography.body.fontSize,
    color: colors.primary,
    fontWeight: '600',
  },
  eventInfo: {
    marginBottom: spacing.md,
  },
  eventTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  eventDetails: {
    gap: spacing.xs,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  eventDetailText: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
  },
  viewEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.cardBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  viewEventButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  ticketsContainer: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
});

export default EventTicketsScreen;
