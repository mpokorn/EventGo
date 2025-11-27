import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { userService } from '../../../services/userService';
import { Card } from '../../../components/ui/Card';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';
import { Transaction, Ticket } from '../../../types';
import { colors, spacing, typography } from '../../../constants/theme';

function ProfileTransactionsTab() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [transactionsData, ticketsData] = await Promise.all([
        userService.getTransactions(user.id),
        userService.getTickets(user.id),
      ]);
      setTransactions(transactionsData);
      setTickets(ticketsData);
    } catch (error: any) {
      console.error('Error loading transactions:', error);
      Alert.alert('Error', error.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Check if all tickets in a transaction are refunded
  const areAllTicketsRefunded = (transactionId: number) => {
    const txTickets = tickets.filter((t) => t.transaction_id === transactionId);
    return txTickets.length > 0 && txTickets.every((t) => t.status === 'refunded');
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'refunded':
        return colors.warning;
      case 'pending':
        return colors.primary;
      case 'failed':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (transactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={64} color={colors.textSecondary} />
        <Text style={styles.emptyText}>No transactions yet</Text>
        <Text style={styles.emptySubtext}>
          Your purchase history will appear here
        </Text>
      </View>
    );
  }

  // Sort transactions by date (most recent first)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <FlatList
      data={sortedTransactions}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => {
        const isRefunded = areAllTicketsRefunded(item.id);
        const displayStatus = isRefunded ? 'refunded' : item.status;

        return (
          <Card style={styles.card}>
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View style={styles.transactionIdContainer}>
                  <Text style={styles.transactionId}>Transaction #{item.id}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(displayStatus) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(displayStatus) },
                      ]}
                    >
                      {getStatusLabel(displayStatus)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.amount}>€{parseFloat(item.total_price.toString()).toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.details}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Event:</Text>
                <Text style={styles.detailValue} numberOfLines={1}>
                  {item.event_title || 'N/A'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Ticket Type:</Text>
                <Text style={styles.detailValue}>{item.ticket_type || 'N/A'}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Quantity:</Text>
                <Text style={styles.detailValue}>{item.quantity || 1}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment:</Text>
                <Text style={styles.detailValue}>
                  {item.payment_method?.toUpperCase() || 'N/A'}
                </Text>
              </View>

              {item.reference_code && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Reference:</Text>
                  <Text style={styles.detailValue}>{item.reference_code}</Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>{formatDate(item.created_at)}</Text>
              </View>

              {isRefunded && (
                <View style={styles.refundNotice}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={styles.refundNoticeText}>
                    Tickets refunded - purchased by someone on the waitlist
                  </Text>
                </View>
              )}
            </View>
          </Card>
        );
      }}
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
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  transactionIdContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  transactionId: {
    color: colors.text,
    fontSize: typography.body.fontSize,
    fontWeight: '700',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: typography.small.fontSize,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  amount: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
  details: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    color: colors.textSecondary,
    fontSize: typography.small.fontSize,
    fontWeight: '500',
    flex: 0.4,
  },
  detailValue: {
    color: colors.text,
    fontSize: typography.small.fontSize,
    flex: 0.6,
    textAlign: 'right',
  },
  refundNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    padding: spacing.sm,
    backgroundColor: colors.success + '10',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  refundNoticeText: {
    color: colors.success,
    fontSize: typography.small.fontSize,
    flex: 1,
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

export default ProfileTransactionsTab;
