import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Alert } from 'react-native';
import { currentUser, deleteAccount } from '../services/api';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export const ProfileScreen: React.FC = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [accountDeleted, setAccountDeleted] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await deleteAccount();
      setIsDeleting(false);
      setShowDeleteModal(false);
      setAccountDeleted(true);
    } catch (err) {
      setIsDeleting(false);
      setShowDeleteModal(false);
      alert('Error deleting account. Please try again.');
    }
  };

  if (accountDeleted) {
    return (
      <View style={styles.deletedContainer}>
        <Text style={styles.deletedTitle}>Account Deleted</Text>
        <Text style={styles.deletedSub}>
          Your account and all associated personal data have been permanently removed from Triangle Cohort Events.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Editorial Header Card */}
      <View style={styles.profileCard}>
        <Image source={{ uri: currentUser.avatar_url }} style={styles.avatar} />
        <Text style={styles.serifName}>{currentUser.name}</Text>
        <Text style={styles.company}>💻 {currentUser.company}</Text>

        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🎓 Cohort of {currentUser.cohort_year}</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Verified Member</Text>
          </View>
        </View>
      </View>

      {/* Cohort Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>12</Text>
          <Text style={styles.statLabel}>Events Attended</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statNum}>5</Text>
          <Text style={styles.statLabel}>Cities Visited</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statNum}>3</Text>
          <Text style={styles.statLabel}>Community Plans</Text>
        </View>
      </View>

      {/* Primary Triangle Cities Preferences */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Preferred Triangle Hubs</Text>
        <View style={styles.chipGrid}>
          {['Durham', 'Cary', 'Raleigh', 'Morrisville', 'Chapel Hill'].map((city) => (
            <View key={city} style={styles.prefChip}>
              <Text style={styles.prefChipText}>📍 {city}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Settings Options */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Account & Privacy</Text>

        <TouchableOpacity style={styles.menuRow}>
          <Text style={styles.menuText}>Cohort Access Code</Text>
          <Text style={styles.menuSub}>RTP-GRAD-2026</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuRow}>
          <Text style={styles.menuText}>Notification Digest</Text>
          <Text style={styles.menuSub}>Weekly (Fridays)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuRow}>
          <Text style={styles.menuText}>Attendance Visibility</Text>
          <Text style={styles.menuSub}>Cohort Only</Text>
        </TouchableOpacity>

        {/* Apple App Store Guideline 5.1.1(v) Account Deletion */}
        <TouchableOpacity
          style={[styles.menuRow, { borderBottomWidth: 0, marginTop: 8 }]}
          onPress={() => setShowDeleteModal(true)}
        >
          <Text style={[styles.menuText, { color: '#D95F4B', fontWeight: '700' }]}>🗑️ Delete Account</Text>
          <Text style={[styles.menuSub, { color: '#D95F4B' }]}>Permanent</Text>
        </TouchableOpacity>
      </View>

      {/* Delete Account Confirmation Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delete Account?</Text>
            <Text style={styles.modalBody}>
              This will permanently delete your account, your RSVPs, custom plans, and all associated personal data from our servers. This action cannot be undone.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteConfirmBtn}
                onPress={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.deleteConfirmBtnText}>Delete Permanently</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
    padding: 20,
  },
  deletedContainer: {
    flex: 1,
    backgroundColor: colors.paper,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  deletedTitle: {
    fontFamily: typography.displayFont,
    fontSize: 24,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 10,
  },
  deletedSub: {
    fontFamily: typography.sansFont,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderRule,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.coral,
    marginBottom: 10,
  },
  serifName: {
    fontFamily: typography.displayFont,
    fontSize: 24,
    fontWeight: '700',
    color: colors.ink,
  },
  company: {
    fontFamily: typography.sansFont,
    fontSize: 13,
    color: colors.forest,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: colors.paper,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderRule,
  },
  badgeText: {
    fontFamily: typography.sansFont,
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  verifiedBadge: {
    backgroundColor: '#D1EBE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.forest,
  },
  verifiedText: {
    fontFamily: typography.sansFont,
    color: colors.forest,
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderRule,
  },
  statNum: {
    fontFamily: typography.sansFont,
    fontSize: 20,
    fontWeight: '800',
    color: colors.ink,
  },
  statLabel: {
    fontFamily: typography.sansFont,
    fontSize: 11,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderRule,
  },
  sectionTitle: {
    fontFamily: typography.displayFont,
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 10,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  prefChip: {
    backgroundColor: colors.paper,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderRule,
  },
  prefChipText: {
    fontFamily: typography.sansFont,
    color: colors.ink,
    fontSize: 12,
    fontWeight: '600',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderRule,
  },
  menuText: {
    fontFamily: typography.sansFont,
    color: colors.ink,
    fontSize: 13,
    fontWeight: '600',
  },
  menuSub: {
    fontFamily: typography.sansFont,
    color: colors.muted,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: colors.paper,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1.5,
    borderColor: colors.ink,
  },
  modalTitle: {
    fontFamily: typography.displayFont,
    fontSize: 20,
    fontWeight: '700',
    color: colors.coral,
    marginBottom: 10,
  },
  modalBody: {
    fontFamily: typography.sansFont,
    fontSize: 14,
    color: colors.ink,
    lineHeight: 20,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderRule,
  },
  cancelBtnText: {
    fontFamily: typography.sansFont,
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
  },
  deleteConfirmBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteConfirmBtnText: {
    fontFamily: typography.sansFont,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
