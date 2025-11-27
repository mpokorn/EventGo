import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import ProfileAccountTab from './tabs/ProfileAccountTab';
import ProfileTicketsTab from './tabs/ProfileTicketsTab';
import ProfileWaitlistTab from './tabs/ProfileWaitlistTab';
import ProfileEventsTab from './tabs/ProfileEventsTab';
import ProfileTransactionsTab from './tabs/ProfileTransactionsTab';
import { colors, spacing, typography } from '../../constants/theme';

type TabType = 'account' | 'tickets' | 'waitlist' | 'events' | 'transactions';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('account');

  const handleLogout = async () => {
    await logout();
    router.push('/(tabs)');
  };

  // If not logged in, show login prompt
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginPrompt}>
          <Ionicons name="person-circle-outline" size={80} color={colors.textSecondary} />
          <Text style={styles.loginTitle}>Login Required</Text>
          <Text style={styles.loginSubtitle}>
            Please login to view your profile, tickets, and transactions
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.registerLinkText}>
              Don't have an account? <Text style={styles.registerLinkBold}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const tabs = [
    { key: 'account' as TabType, label: 'Account', icon: 'person-outline' },
    { key: 'tickets' as TabType, label: 'Tickets', icon: 'ticket-outline' },
    { key: 'waitlist' as TabType, label: 'Waitlist', icon: 'time-outline' },
    { key: 'events' as TabType, label: 'My Events', icon: 'calendar-outline' },
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
        return <ProfileTicketsTab />;
      case 'waitlist':
        return <ProfileWaitlistTab />;
      case 'events':
        return <ProfileEventsTab />;
      case 'transactions':
        return <ProfileTransactionsTab />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
    </SafeAreaView>
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
    padding: spacing.md,
    paddingTop: spacing.md,
  },
  greeting: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  name: {
    ...typography.h2,
    color: colors.text,
  },
  logoutButton: {
    padding: spacing.sm,
  },
  tabsContainer: {
    maxHeight: 55,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  tabsContent: {
    paddingHorizontal: spacing.md,
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
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loginTitle: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  loginSubtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl * 2,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerLink: {
    marginTop: spacing.sm,
  },
  registerLinkText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  registerLinkBold: {
    color: colors.primary,
    fontWeight: '600',
  },
});
