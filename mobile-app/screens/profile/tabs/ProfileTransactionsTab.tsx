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
import { Card } from '../../../components/ui/Card';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../../../types';
import { colors, spacing, typography } from '../../../constants/theme';

function ProfileTransactionsTab() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      const data = await userService.getTransactions();
      setTransactions(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'Purchase';
      case 'refund':
        return 'Refund';
      case 'refund_fee':
        return 'Refund Fee';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return colors.error;
      case 'refund':
        return colors.success;
      case 'refund_fee':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'arrow-down-outline';
      case 'refund':
        return 'arrow-up-outline';
      case 'refund_fee':
        return 'alert-circle-outline';
      default:
        return 'swap-horizontal-outline';
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

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <Card style={styles.card}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={getTypeIcon(item.transaction_type) as any}
                size={24}
                color={getTypeColor(item.transaction_type)}
              />
            </View>
            <View style={styles.info}>
              <Text style={styles.eventTitle}>{item.event_title}</Text>
              <Text style={styles.ticketType}>{item.ticket_type_name}</Text>
            </View>
            <View style={styles.amountContainer}>
              <Text
                style={[
                  styles.amount,
                  { color: getTypeColor(item.transaction_type) },
                ]}
              >
                {item.transaction_type === 'purchase' ? '-' : '+'}€
                {Math.abs(item.amount).toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {getTypeLabel(item.transaction_type)}
              </Text>
            </View>
            <Text style={styles.date}>{formatDate(item.created_at)}</Text>
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
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  eventTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  ticketType: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    color: colors.textSecondary,
    fontSize: 12,
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
