import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../../constants/theme';

interface LoadingSpinnerProps {
  text?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text,
  fullScreen = false,
}) => {
  const containerStyle = fullScreen ? styles.fullScreen : styles.inline;

  return (
    <View style={containerStyle}>
      <ActivityIndicator size="large" color={colors.primary} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  inline: {
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: colors.text,
    marginTop: spacing.md,
    fontSize: 16,
  },
});
