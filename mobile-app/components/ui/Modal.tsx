import React, { ReactNode } from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { Button } from './Button';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'confirm' | 'alert';
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
}) => {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>{children}</ScrollView>

          {type === 'confirm' && (
            <View style={styles.footer}>
              <Button
                title={cancelText}
                onPress={onClose}
                variant="ghost"
                style={styles.button}
              />
              <Button
                title={confirmText}
                onPress={() => {
                  onConfirm?.();
                  onClose();
                }}
                variant="primary"
                style={styles.button}
              />
            </View>
          )}
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modal: {
    backgroundColor: '#1a2332',
    borderRadius: borderRadius.lg,
    width: '100%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    padding: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  button: {
    flex: 1,
  },
});
