import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, radii } from '../theme/colors';
import { useFontTheme } from '../theme/typography';
import { currentUser } from '../services/api';

interface HeaderProps {
  onOpenCreate: () => void;
  onOpenIngestion: () => void;
  onOpenSyncCalendar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCreate, onOpenIngestion, onOpenSyncCalendar }) => {
  const { displayFont, sansFont } = useFontTheme();

  return (
    <View style={styles.container}>
      <View style={styles.leftBox}>
        <Text style={[styles.brandTitle, { fontFamily: displayFont }]}>Triangle Social</Text>
        <Text style={[styles.tagline, { fontFamily: sansFont }]}>Local events & plans · Cohort of '26</Text>
      </View>

      <View style={styles.rightActions}>
        {onOpenSyncCalendar ? (
          <TouchableOpacity style={styles.calSyncBtn} onPress={onOpenSyncCalendar}>
            <Text style={[styles.calSyncBtnText, { fontFamily: sansFont }]}>📅 Sync Cal</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.digestBtn} onPress={onOpenIngestion}>
          <Text style={[styles.digestBtnText, { fontFamily: sansFont }]}>Import Digest</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.createBtn} onPress={onOpenCreate}>
          <Text style={[styles.createBtnText, { fontFamily: sansFont }]}>+ Create Plan</Text>
        </TouchableOpacity>

        <Image source={{ uri: currentUser.avatar_url }} style={styles.avatar} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.paper,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderRule,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftBox: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calSyncBtn: {
    backgroundColor: colors.sand,
    borderColor: colors.coral,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radii.button,
    borderWidth: 1,
  },
  calSyncBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.ink,
  },
  digestBtn: {
    backgroundColor: colors.paper,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: colors.borderRule,
  },
  digestBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.ink,
  },
  createBtn: {
    backgroundColor: colors.ink,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.button,
  },
  createBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.paper,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.coral,
    marginLeft: 2,
  },
});
