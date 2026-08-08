import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { currentUser } from '../services/api';

interface HeaderProps {
  onOpenCreate: () => void;
  onTriggerIngest: () => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCreate,
  onTriggerIngest,
  selectedCity,
  onSelectCity,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.brandBox}>
          <View style={styles.liveDot} />
          <Text style={styles.subBrand}>Triangle Cohort · '26</Text>
        </View>

        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.digestBtn} onPress={onTriggerIngest}>
            <Text style={styles.digestBtnText}>⚡ Import Digest</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.createBtn} onPress={onOpenCreate}>
            <Text style={styles.createBtnText}>+ Plan</Text>
          </TouchableOpacity>

          <Image source={{ uri: currentUser.avatar_url }} style={styles.avatar} />
        </View>
      </View>

      <View style={styles.mainTitleRow}>
        <Text style={styles.title}>Triangle Social</Text>
        <Text style={styles.editorialTag}>A local culture magazine for your cohort</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.paper,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.ticketBorder,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  brandBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.coral,
    marginRight: 6,
  },
  subBrand: {
    fontFamily: typography.sansFont,
    fontSize: typography.scale.label.fontSize,
    fontWeight: typography.scale.label.fontWeight,
    color: colors.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  digestBtn: {
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.ticketBorder,
  },
  digestBtnText: {
    fontFamily: typography.sansFont,
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink,
  },
  createBtn: {
    backgroundColor: colors.ink,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  createBtnText: {
    fontFamily: typography.sansFont,
    fontSize: 12,
    fontWeight: '700',
    color: colors.paper,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.coral,
  },
  mainTitleRow: {
    marginTop: 4,
  },
  title: {
    fontFamily: typography.displayFont,
    fontSize: typography.scale.hero.fontSize,
    lineHeight: typography.scale.hero.lineHeight,
    fontWeight: typography.scale.hero.fontWeight,
    color: colors.ink,
    letterSpacing: -0.5,
  },
  editorialTag: {
    fontFamily: typography.sansFont,
    fontSize: 13,
    color: colors.muted,
    fontStyle: 'italic',
    marginTop: 1,
  },
});
