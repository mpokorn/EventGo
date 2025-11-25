import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import ProfileAccountTab from './tabs/ProfileAccountTab';
import ProfileTicketsTab from './tabs/ProfileTicketsTab';
import ProfileWaitlistTab from './tabs/ProfileWaitlistTab';
import ProfileEventsTab from './tabs/ProfileEventsTab';
import ProfileTransactionsTab from './tabs/ProfileTransactionsTab';
import { colors, spacing, typography } from '../../constants/theme';

type TabType = 'account' | 'tickets' | 'waitlist' | 'events' | 'transactions';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('account');

  const handleLogout = async () => {
    await logout();
  };

  const tabs = [
    { key: 'account' as TabType, label: 'Account', icon: 'person-outline' },
    { key: 'tickets' as TabType, label: 'Tickets', icon: 'ticket-outline' },
    { key: 'waitlist' as TabType, label: 'Waitlist', icon: 'time-outline' },
    { key: 'events' as TabType, label: 'Events', icon: 'calendar-outline' },
    {
      key: 'transactions' as TabType,
      label: 'Transactions',
      icon: 'receipt-outline',
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return <ProfileAccountTab />;
      case 'tickets':
        return <ProfileTicketsTab navigation={navigation} />;
      case 'waitlist':
        return <ProfileWaitlistTab />;
      case 'events':
        return <ProfileEventsTab navigation={navigation} />;
      case 'transactions':
        return <ProfileTransactionsTab />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.name}>
            {user?.first_name} {user?.last_name}
          </Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.key ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.key && styles.activeTabLabel,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.content}>{renderTabContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  greeting: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  name: {
    ...typography.h2,
    color: colors.text,
  },
  logoutButton: {
    padding: spacing.sm,
  },
  tabsContainer: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  tabsContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    gap: spacing.xs,
  },
  activeTab: {
    backgroundColor: colors.primary + '20',
  },
  tabLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabLabel: {
    color: colors.primary,
  },
  content: {
    flex: 1,
  },
});
