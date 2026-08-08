import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { currentUser } from '../services/api';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export const ProfileScreen: React.FC = () => {
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
          <Text style={styles.menuText}> Cohort Access Code</Text>
          <Text style={styles.menuSub}>RTP-GRAD-2026</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuRow}>
          <Text style={styles.menuText}> Notification Digest</Text>
          <Text style={styles.menuSub}>Weekly (Fridays)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuRow}>
          <Text style={styles.menuText}> Attendance Visibility</Text>
          <Text style={styles.menuSub}>Cohort Only</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
    padding: 20,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.ticketBorder,
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
    borderColor: colors.ticketBorder,
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
    borderColor: colors.ticketBorder,
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
    borderColor: colors.ticketBorder,
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
    borderColor: colors.ticketBorder,
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
    borderBottomColor: colors.ticketBorder,
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
});
