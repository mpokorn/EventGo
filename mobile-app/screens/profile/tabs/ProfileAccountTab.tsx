import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { userService } from '../../../services/userService';
import { TextInput } from '../../../components/ui/TextInput';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Modal } from '../../../components/ui/Modal';
import { colors, spacing, typography } from '../../../constants/theme';

function ProfileAccountTab() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    oldPassword: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        oldPassword: '',
        password: '',
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.first_name.trim().length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters';
    }

    if (formData.last_name.trim().length < 2) {
      newErrors.last_name = 'Last name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (formData.password) {
      if (!formData.oldPassword) {
        newErrors.oldPassword = 'Current password is required to change password';
      }

      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/(?=.*[a-z])/.test(formData.password)) {
        newErrors.password = 'Password must contain a lowercase letter';
      } else if (!/(?=.*[A-Z])/.test(formData.password)) {
        newErrors.password = 'Password must contain an uppercase letter';
      } else if (!/(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain a number';
      } else if (!/(?=.*[@$!%*?&])/.test(formData.password)) {
        newErrors.password = 'Password must contain a special character';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm() || !user?.id) return;

    setLoading(true);
    try {
      const updateData: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
      };

      if (formData.password) {
        updateData.password = formData.password;
        updateData.oldPassword = formData.oldPassword;
      }

      const response = await userService.updateProfile(user.id, updateData);
      setUser(response.user);
      setFormData((prev) => ({ ...prev, oldPassword: '', password: '' }));
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      await userService.deleteAccount(user.id);
      Alert.alert('Success', 'Account deleted successfully');
      // Logout will be handled by backend clearing tokens
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete account');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (loading && !formData.email) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.sectionTitle}>Account Information</Text>

        <TextInput
          label="First Name"
          value={formData.first_name}
          onChangeText={(value: string) =>
            setFormData((prev) => ({ ...prev, first_name: value }))
          }
          error={errors.first_name}
          autoCapitalize="words"
        />

        <TextInput
          label="Last Name"
          value={formData.last_name}
          onChangeText={(value: string) =>
            setFormData((prev) => ({ ...prev, last_name: value }))
          }
          error={errors.last_name}
          autoCapitalize="words"
        />

        <TextInput
          label="Email"
          value={formData.email}
          onChangeText={(value: string) =>
            setFormData((prev) => ({ ...prev, email: value }))
          }
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Change Password</Text>
        <Text style={styles.sectionDescription}>
          Leave blank to keep current password
        </Text>

        <TextInput
          label="Current Password"
          value={formData.oldPassword}
          onChangeText={(value: string) =>
            setFormData((prev) => ({ ...prev, oldPassword: value }))
          }
          error={errors.oldPassword}
          placeholder="Enter current password to change it"
          secureTextEntry
          autoCapitalize="none"
        />

        <TextInput
          label="New Password"
          value={formData.password}
          onChangeText={(value: string) =>
            setFormData((prev) => ({ ...prev, password: value }))
          }
          error={errors.password}
          placeholder="Enter new password"
          secureTextEntry
          autoCapitalize="none"
        />
      </Card>

      <Button
        title="Save Changes"
        onPress={handleUpdate}
        loading={loading}
        style={styles.saveButton}
      />

      <Card style={styles.dangerZone}>
        <View style={styles.dangerContent}>
          <Text style={styles.dangerTitle}>Delete Account</Text>
          <Text style={styles.dangerDescription}>
            Once you delete your account, there is no going back.
          </Text>
        </View>
        <Button
          title="Delete Account"
          onPress={() => setShowDeleteModal(true)}
          variant="danger"
        />
      </Card>

      <Modal
        visible={showDeleteModal}
        type="confirm"
        title="Delete Account"
        onClose={() => setShowDeleteModal(false)}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteAccount}
      >
        <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
          Are you sure you want to delete your account? This action cannot be undone.
        </Text>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  saveButton: {
    marginTop: spacing.md,
  },
  dangerZone: {
    borderColor: colors.error,
    borderWidth: 1,
    marginTop: spacing.lg,
  },
  dangerContent: {
    marginBottom: spacing.md,
  },
  dangerTitle: {
    ...typography.h3,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  dangerDescription: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});

export default ProfileAccountTab;
