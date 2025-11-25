import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Ticket } from '../../types';
import { Card } from '../ui/Card';
import { colors, spacing, typography } from '../../constants/theme';
import { Button } from '../ui/Button';

interface TicketCardProps {
  ticket: Ticket;
  onRefund?: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  onRefund,
  onAccept,
  onDecline,
}) => {
  const issuedDate = new Date(ticket.issued_at);

  const getStatusColor = () => {
    switch (ticket.status) {
      case 'active':
        return colors.success;
      case 'reserved':
        return colors.warning;
      case 'pending_return':
        return colors.warning;
      case 'refunded':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = () => {
    switch (ticket.status) {
      case 'active':
        return 'Active';
      case 'reserved':
        return 'Reserved';
      case 'pending_return':
        return 'Pending Return';
      case 'refunded':
        return 'Refunded';
      default:
        return ticket.status;
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.ticketId}>Ticket #{ticket.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
        </View>
        {ticket.title && (
          <Text style={styles.eventTitle} numberOfLines={1}>
            {ticket.title}
          </Text>
        )}
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="pricetag-outline" size={16} color={colors.primary} />
          <Text style={styles.detailText}>
            {ticket.ticket_type} - €{ticket.ticket_price}
          </Text>
        </View>

        {ticket.start_datetime && (
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.primary} />
            <Text style={styles.detailText}>
              {new Date(ticket.start_datetime).toLocaleDateString()}
            </Text>
          </View>
        )}

        {ticket.location && (
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color={colors.primary} />
            <Text style={styles.detailText} numberOfLines={1}>
              {ticket.location}
            </Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailTextSecondary}>
            Issued: {issuedDate.toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Actions for reserved tickets */}
      {ticket.status === 'reserved' && onAccept && onDecline && (
        <View style={styles.actions}>
          <Button
            title="Accept"
            onPress={onAccept}
            variant="primary"
            style={styles.actionButton}
          />
          <Button
            title="Decline"
            onPress={onDecline}
            variant="ghost"
            style={styles.actionButton}
          />
        </View>
      )}

      {/* Action for active tickets */}
      {ticket.status === 'active' && onRefund && (
        <View style={styles.actions}>
          <Button
            title="Request Refund"
            onPress={onRefund}
            variant="danger"
            style={styles.fullButton}
          />
        </View>
      )}

      {/* Status messages */}
      {ticket.status === 'pending_return' && (
        <View style={styles.statusMessage}>
          <Text style={styles.statusMessageText}>
            Your ticket is being offered to the waitlist. You'll be refunded when
            someone accepts it.
          </Text>
        </View>
      )}

      {ticket.status === 'refunded' && (
        <View style={[styles.statusMessage, { backgroundColor: colors.success + '20' }]}>
          <Text style={styles.statusMessageText}>
            Your ticket was successfully sold and you have been refunded (2% platform
            fee applied).
          </Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  ticketId: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  eventTitle: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  details: {
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailText: {
    color: colors.text,
    fontSize: 14,
    marginLeft: spacing.sm,
    flex: 1,
  },
  detailTextSecondary: {
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  fullButton: {
    flex: 1,
  },
  statusMessage: {
    backgroundColor: colors.warning + '20',
    padding: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  statusMessageText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
  },
});
