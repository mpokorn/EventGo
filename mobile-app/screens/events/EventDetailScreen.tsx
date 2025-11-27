import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { eventService } from '../../services/eventService';
import { Event, TicketType } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { colors, spacing, typography } from '../../constants/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function EventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const eventId = Number(id);
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [joiningWaitlist, setJoiningWaitlist] = useState(false);
  const [selectedTicketType, setSelectedTicketType] = useState<TicketType | null>(
    null
  );
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      const [eventData, ticketTypesData] = await Promise.all([
        eventService.getEvent(eventId),
        eventService.getTicketTypes(eventId),
      ]);
      setEvent(eventData);
      setTicketTypes(ticketTypesData || []);
    } catch (err: any) {
      console.error('Error loading event details:', err);
      const errorMessage = err?.response?.data?.message || 'Failed to load event details';
      Alert.alert('Error', errorMessage);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedTicketType || !user?.id) return;

    setPurchasing(true);
    try {
      await eventService.purchaseTicket({
        event_id: eventId,
        ticket_type_id: selectedTicketType.id,
        quantity: 1,
        payment_method: 'card',
      });

      Alert.alert('Success', 'Ticket purchased successfully!', [
        { text: 'OK', onPress: () => {
          setShowPurchaseModal(false);
          loadEventDetails();
          router.push('/(tabs)/profile');
        }},
      ]);
    } catch (err: any) {
      console.error('Error purchasing ticket:', err);
      Alert.alert(
        'Error',
        err?.response?.data?.message || 'Failed to purchase ticket'
      );
    } finally {
      setPurchasing(false);
    }
  };

  const handleJoinWaitlist = async () => {
    if (!user?.id) {
      Alert.alert('Login Required', 'Please login to join the waitlist');
      return;
    }

    setJoiningWaitlist(true);
    try {
      const response = await eventService.joinWaitlist(user.id, eventId);
      
      if (response.ticket_offered) {
        Alert.alert(
          'Ticket Available!',
          'A returned ticket is available! You have been offered a ticket. Please check your profile to accept or decline it.',
          [
            { text: 'OK', onPress: () => router.push('/(tabs)/profile') }
          ]
        );
      } else if (response.position) {
        Alert.alert(
          'Success',
          `You have been added to the waitlist! You are #${response.position} in line.`
        );
      } else {
        Alert.alert('Success', 'You have been added to the waitlist!');
      }
      
      loadEventDetails();
    } catch (err: any) {
      console.error('Error joining waitlist:', err);
      Alert.alert(
        'Error',
        err?.response?.data?.message || 'Failed to join waitlist'
      );
    } finally {
      setJoiningWaitlist(false);
    }
  };

  const handleTicketTypePress = (ticketType: TicketType) => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to purchase tickets');
      return;
    }

    if (ticketType.tickets_sold >= ticketType.total_tickets) {
      Alert.alert('Sold Out', 'This ticket type is sold out');
      return;
    }

    setSelectedTicketType(ticketType);
    setShowPurchaseModal(true);
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading event..." />;
  }

  if (!event) {
    return null;
  }

  const startDate = new Date(event.start_datetime);
  const endDate = new Date(event.end_datetime);
  const isUpcoming = startDate > new Date();
  const availableTicketsCount = event.total_tickets - (event.tickets_sold || 0);
  const availableTickets = availableTicketsCount > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.title}>{event.title}</Text>

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Date & Time</Text>
              <Text style={styles.infoValue}>
                {startDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              <Text style={styles.infoValue}>
                {startDate.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={colors.primary} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{event.location}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color={colors.primary} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Organizer</Text>
              <Text style={styles.infoValue}>
                {event.organizer_name || `Organizer #${event.organizer_id}`}
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Event</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>

        {isUpcoming && ticketTypes && ticketTypes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ticket Types</Text>
            {ticketTypes.map((ticketType) => {
              const ticketsSold = ticketType.tickets_sold || 0;
              const ticketsAvailable = ticketType.total_tickets - ticketsSold;
              const soldOut = ticketsAvailable <= 0;
              
              return (
                <TouchableOpacity
                  key={ticketType.id}
                  onPress={() => !soldOut && handleTicketTypePress(ticketType)}
                  disabled={soldOut}
                  activeOpacity={soldOut ? 1 : 0.7}
                >
                  <Card style={{...styles.ticketTypeCard, ...(soldOut ? styles.ticketTypeCardDisabled : {})}}>
                    <View style={styles.ticketTypeHeader}>
                      <Text style={styles.ticketTypeName}>{ticketType.type}</Text>
                      <Text style={styles.ticketTypePrice}>€{ticketType.price}</Text>
                    </View>
                    <View style={styles.ticketTypeFooter}>
                      <Text style={[styles.ticketTypeAvailable, soldOut && styles.ticketTypeSoldOut]}>
                        {ticketsAvailable} / {ticketType.total_tickets} available
                      </Text>
                      {soldOut && (
                        <View style={styles.soldOutBadge}>
                          <Text style={styles.soldOutText}>Sold Out</Text>
                        </View>
                      )}
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {isUpcoming && (!ticketTypes || ticketTypes.length === 0) && (
          <Card style={styles.noTicketsCard}>
            <Ionicons name="ticket-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.noTicketsText}>
              No tickets available yet
            </Text>
            <Text style={styles.noTicketsSubtext}>
              Tickets for this event haven't been set up yet. Check back later!
            </Text>
          </Card>
        )}

        {isUpcoming && ticketTypes && ticketTypes.length > 0 && !availableTickets && (
          <Button
            title="Join Waitlist"
            onPress={handleJoinWaitlist}
            loading={joiningWaitlist}
            style={styles.waitlistButton}
          />
        )}
      </ScrollView>

      <Modal
        visible={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        title="Confirm Purchase"
        type="confirm"
        onConfirm={handlePurchase}
        confirmText="Purchase"
        cancelText="Cancel"
      >
        {selectedTicketType && (
          <View>
            <Text style={styles.modalText}>
              You are about to purchase:
            </Text>
            <Text style={styles.modalTicketType}>
              {selectedTicketType.type}
            </Text>
            <Text style={styles.modalPrice}>
              Price: €{selectedTicketType.price}
            </Text>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  backButton: {
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoCard: {
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  infoTextContainer: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    marginBottom: 2,
  },
  infoValue: {
    color: colors.text,
    fontSize: 15,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  ticketTypeCard: {
    marginBottom: spacing.sm,
  },
  ticketTypeCardDisabled: {
    opacity: 0.6,
  },
  ticketTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  ticketTypeName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  ticketTypePrice: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  ticketTypeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketTypeAvailable: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  ticketTypeSoldOut: {
    color: colors.error,
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
  waitlistButton: {
    marginTop: spacing.lg,
  },
  noTicketsCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.md,
  },
  noTicketsText: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  noTicketsSubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalText: {
    color: colors.textSecondary,
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  modalTicketType: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  modalPrice: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '600',
  },
});
