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
import { TicketCard } from '../../../components/tickets/TicketCard';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Ticket } from '../../../types';
import { colors, spacing, typography } from '../../../constants/theme';

function ProfileTicketsTab({ navigation }: any) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      const data = await userService.getTickets();
      setTickets(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const handleAccept = async (ticketId: number) => {
    try {
      await userService.acceptWaitlistTicket(ticketId);
      Alert.alert('Success', 'Ticket accepted successfully');
      fetchTickets();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to accept ticket');
    }
  };

  const handleDecline = async (ticketId: number) => {
    try {
      await userService.declineWaitlistTicket(ticketId);
      Alert.alert('Success', 'Ticket declined');
      fetchTickets();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to decline ticket');
    }
  };

  const handleRefund = async (ticketId: number) => {
    Alert.alert(
      'Request Refund',
      'Are you sure you want to request a refund for this ticket?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Refund',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.refundTicket(ticketId);
              Alert.alert('Success', 'Refund requested successfully');
              fetchTickets();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to request refund');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (tickets.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No tickets yet</Text>
        <Text style={styles.emptySubtext}>
          Your purchased tickets will appear here
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={tickets}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TicketCard
          ticket={item}
          onAccept={() => handleAccept(item.id)}
          onDecline={() => handleDecline(item.id)}
          onRefund={() => handleRefund(item.id)}
        />
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
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default ProfileTicketsTab;
