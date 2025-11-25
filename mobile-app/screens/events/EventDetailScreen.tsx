import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { eventService } from '../../services/eventService';
import { Event, TicketType } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { colors, spacing, typography } from '../../constants/theme';

export default function EventDetailScreen({ route, navigation }: any) {
  const { eventId } = route.params;
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
      setTicketTypes(ticketTypesData);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to load event details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedTicketType || !user) return;

    setPurchasing(true);
    try {
      await eventService.purchaseTicket({
        event_id: eventId,
        ticket_type_id: selectedTicketType.id,
        quantity: 1,
      });

      Alert.alert('Success', 'Ticket purchased successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Profile') },
      ]);
      setShowPurchaseModal(false);
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.response?.data?.message || 'Failed to purchase ticket'
      );
    } finally {
      setPurchasing(false);
    }
  };

  const handleJoinWaitlist = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to join the waitlist');
      return;
    }

    setJoiningWaitlist(true);
    try {
      await eventService.joinWaitlist(eventId);
      Alert.alert('Success', 'You have been added to the waitlist!');
      loadEventDetails();
    } catch (err: any) {
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
  const availableTickets = event.available_tickets > 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
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

        {isUpcoming && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ticket Types</Text>
            {ticketTypes.map((ticketType) => {
              const soldOut =
                ticketType.tickets_sold >= ticketType.total_tickets;
              return (
                <TouchableOpacity
                  key={ticketType.id}
                  onPress={() => !soldOut && handleTicketTypePress(ticketType)}
                  disabled={soldOut}
                >
                  <Card style={styles.ticketTypeCard}>
                    <View style={styles.ticketTypeHeader}>
                      <Text style={styles.ticketTypeName}>{ticketType.type}</Text>
                      <Text style={styles.ticketTypePrice}>€{ticketType.price}</Text>
                    </View>
                    <View style={styles.ticketTypeFooter}>
                      <Text style={styles.ticketTypeAvailable}>
                        {ticketType.total_tickets - ticketType.tickets_sold} /{' '}
                        {ticketType.total_tickets} available
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

        {isUpcoming && !availableTickets && (
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  infoCard: {
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  infoTextContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    color: colors.text,
    fontSize: 16,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  ticketTypeCard: {
    marginBottom: spacing.sm,
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
  modalText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  modalTicketType: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  modalPrice: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
});
