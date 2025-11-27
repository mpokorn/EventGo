import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  SectionList,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { userService } from '../../../services/userService';
import { eventService } from '../../../services/eventService';
import { TicketCard } from '../../../components/tickets/TicketCard';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Ticket, Event } from '../../../types';
import { colors, spacing, typography } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface TicketSection {
  title: string;
  data: Ticket[];
  type: 'reserved' | 'active' | 'pending_return' | 'refunded' | 'expired';
}

function ProfileTicketsTab() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTicketsAndEvents = useCallback(async () => {
    if (!user?.id) return;
    try {
      const ticketsData = await userService.getTickets(user.id);
      setTickets(ticketsData);

      // Fetch events for sold-out check
      const eventIds = [...new Set(ticketsData.map(t => t.event_id).filter(Boolean))];
      if (eventIds.length > 0) {
        const eventPromises = eventIds.map(id => eventService.getEvent(id));
        const eventsData = await Promise.all(eventPromises);
        setEvents(eventsData.filter(Boolean));
      }
    } catch (error: any) {
      console.error('Error loading tickets:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchTicketsAndEvents();
  }, [fetchTicketsAndEvents]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTicketsAndEvents();
  };

  // Check if event is sold out
  const isEventSoldOut = (eventId: number) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return false;
    return event.tickets_sold >= event.total_tickets;
  };

  const handleAccept = async (ticket: Ticket) => {
    Alert.alert(
      'Accept Ticket',
      'Are you sure you want to accept this ticket offer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              const result = await userService.acceptTicket(ticket.transaction_id);
              Alert.alert('Success', result.message || 'Ticket accepted successfully');
              fetchTicketsAndEvents();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to accept ticket');
            }
          },
        },
      ]
    );
  };

  const handleDecline = async (ticket: Ticket) => {
    Alert.alert(
      'Decline Ticket',
      'Are you sure you want to decline this ticket offer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await userService.declineTicket(ticket.transaction_id);
              Alert.alert('Success', result.message || 'Ticket declined');
              fetchTicketsAndEvents();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to decline ticket');
            }
          },
        },
      ]
    );
  };

  const handleRefund = async (ticketId: number, eventId: number) => {
    const soldOut = isEventSoldOut(eventId);
    
    if (!soldOut) {
      Alert.alert(
        'Cannot Return Ticket',
        'Tickets can only be returned for sold out events.'
      );
      return;
    }

    Alert.alert(
      'Return Ticket to Waitlist',
      'Your ticket will be offered to the waitlist. You\'ll keep access until someone else accepts it. You will receive a refund of 98% of the ticket price (2% platform fee).',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Return',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await userService.refundTicket(ticketId);
              
              // Show success message from backend
              Alert.alert('Success', result.message || 'Ticket return requested');
              
              // Refresh tickets and events (also refreshes waitlist status)
              fetchTicketsAndEvents();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to return ticket');
            }
          },
        },
      ]
    );
  };

  // Categorize tickets like frontend
  const now = new Date();
  
  const reservedTickets = tickets.filter(t => t.status === 'reserved');
  const pendingReturnTickets = tickets.filter(t => t.status === 'pending_return');
  const refundedTickets = tickets.filter(t => t.status === 'refunded');
  
  const activeTickets = tickets.filter(t => {
    if (t.status === 'reserved' || t.status === 'refunded' || t.status === 'pending_return') return false;
    
    const end = t.end_datetime ? new Date(t.end_datetime) : null;
    const start = t.start_datetime ? new Date(t.start_datetime) : null;

    if (end instanceof Date && !isNaN(end.getTime())) return end > now;
    if (start instanceof Date && !isNaN(start.getTime())) return start > now;

    return true;
  });

  const expiredTickets = tickets.filter(t => {
    if (t.status === 'reserved' || t.status === 'refunded' || t.status === 'pending_return') return false;
    
    const end = t.end_datetime ? new Date(t.end_datetime) : null;
    const start = t.start_datetime ? new Date(t.start_datetime) : null;

    if (end instanceof Date && !isNaN(end.getTime())) return end <= now;
    if (start instanceof Date && !isNaN(start.getTime())) return start <= now;

    return false;
  });

  // Check if user has any eligible tickets for return
  const hasEligibleTickets = activeTickets.some(t => isEventSoldOut(t.event_id));

  // Build sections array
  const sections: TicketSection[] = [];
  
  if (reservedTickets.length > 0) {
    sections.push({
      title: '🎫 Ticket Offers (from Waitlist)',
      data: reservedTickets,
      type: 'reserved'
    });
  }
  
  if (activeTickets.length > 0) {
    sections.push({
      title: 'Active Tickets',
      data: activeTickets,
      type: 'active'
    });
  }
  
  if (pendingReturnTickets.length > 0) {
    sections.push({
      title: 'Pending Return',
      data: pendingReturnTickets,
      type: 'pending_return'
    });
  }
  
  if (refundedTickets.length > 0) {
    sections.push({
      title: 'Successfully Refunded',
      data: refundedTickets,
      type: 'refunded'
    });
  }
  
  if (expiredTickets.length > 0) {
    sections.push({
      title: 'Expired Tickets',
      data: expiredTickets,
      type: 'expired'
    });
  }

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (tickets.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="ticket-outline" size={64} color={colors.textSecondary} />
        <Text style={styles.emptyText}>No tickets yet</Text>
        <Text style={styles.emptySubtext}>
          Your purchased tickets will appear here
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {hasEligibleTickets && (
        <View style={styles.notice}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <View style={styles.noticeTextContainer}>
            <Text style={styles.noticeTitle}>Can't attend the event?</Text>
            <Text style={styles.noticeText}>
              You can return eligible tickets below for sold-out events
            </Text>
          </View>
        </View>
      )}

      {sections.map((section, index) => (
        <View key={index} style={styles.section}>
          <Text style={[
            styles.sectionTitle,
            section.type === 'reserved' && styles.sectionTitleSuccess,
            section.type === 'pending_return' && styles.sectionTitleWarning,
            section.type === 'refunded' && styles.sectionTitleSuccess,
          ]}>
            {section.title}
          </Text>
          
          {section.type === 'active' && section.data.length === 0 && (
            <Text style={styles.emptySection}>No active tickets.</Text>
          )}
          
          {section.type === 'expired' && section.data.length === 0 && (
            <Text style={styles.emptySection}>No expired tickets.</Text>
          )}

          {section.data.map(ticket => {
            const soldOut = isEventSoldOut(ticket.event_id);
            
            return (
              <View key={ticket.id} style={styles.ticketContainer}>
                <TicketCard
                  ticket={ticket}
                  onAccept={section.type === 'reserved' ? () => handleAccept(ticket) : undefined}
                  onDecline={section.type === 'reserved' ? () => handleDecline(ticket) : undefined}
                  onRefund={section.type === 'active' && soldOut ? () => handleRefund(ticket.id, ticket.event_id) : undefined}
                />
                
                {section.type === 'active' && !soldOut && (
                  <View style={styles.hint}>
                    <Text style={styles.hintText}>
                      Tickets can only be returned for sold out events
                    </Text>
                  </View>
                )}
                
                {section.type === 'active' && soldOut && (
                  <View style={styles.soldOutIndicator}>
                    <Ionicons name="ellipse" size={8} color={colors.error} />
                    <Text style={styles.soldOutText}>Sold Out</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
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
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  notice: {
    flexDirection: 'row',
    backgroundColor: colors.primary + '20',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
    alignItems: 'flex-start',
  },
  noticeTextContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  noticeTitle: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 2,
  },
  noticeText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionTitleSuccess: {
    color: colors.success,
  },
  sectionTitleWarning: {
    color: colors.warning,
  },
  emptySection: {
    color: colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  ticketContainer: {
    marginBottom: spacing.md,
  },
  hint: {
    backgroundColor: colors.textSecondary + '20',
    padding: spacing.sm,
    borderRadius: 6,
    marginTop: spacing.xs,
  },
  hintText: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 14,
  },
  soldOutIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  soldOutText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ProfileTicketsTab;
