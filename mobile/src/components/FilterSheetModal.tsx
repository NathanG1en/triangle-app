import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { colors, radii } from '../theme/colors';
import { useFontTheme } from '../theme/typography';

interface FilterSheetModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  freeOnly: boolean;
  onToggleFreeOnly: () => void;
  timeType: 'all' | 'timed' | 'untimed';
  onSelectTimeType: (type: 'all' | 'timed' | 'untimed') => void;
  onReset: () => void;
}

const CITIES = ['All', 'Durham', 'Cary', 'Raleigh', 'Morrisville', 'Chapel Hill'];
const CATEGORIES = ['All', 'Food & Drink', 'Outdoor & Fitness', 'Tech & Professional', 'Arts & Music', 'Sports', 'Social'];
const TIME_TYPES: { id: 'all' | 'timed' | 'untimed'; label: string }[] = [
  { id: 'all', label: '🌐 All Items' },
  { id: 'timed', label: '⏰ Timed Events Only' },
  { id: 'untimed', label: '📍 Anytime Spots Only' },
];

export const FilterSheetModal: React.FC<FilterSheetModalProps> = ({
  visible,
  onClose,
  selectedCity,
  onSelectCity,
  selectedCategory,
  onSelectCategory,
  freeOnly,
  onToggleFreeOnly,
  timeType,
  onSelectTimeType,
  onReset,
}) => {
  const { displayFont, sansFont } = useFontTheme();

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.topRow}>
            <Text style={[styles.title, { fontFamily: displayFont }]}>Filter Triangle Listings</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Timed vs Untimed Spot Filter */}
            <Text style={[styles.sectionTitle, { fontFamily: sansFont }]}>Time Type (Scheduled vs. Spot)</Text>
            <View style={styles.grid}>
              {TIME_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.pillChip, timeType === t.id && styles.activePillChip]}
                  onPress={() => onSelectTimeType(t.id)}
                >
                  <Text style={[styles.pillChipText, { fontFamily: sansFont }, timeType === t.id && styles.activePillText]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* City Section */}
            <Text style={[styles.sectionTitle, { fontFamily: sansFont }]}>Triangle Hub / Neighborhood</Text>
            <View style={styles.grid}>
              {CITIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.pillChip, selectedCity === c && styles.activePillChip]}
                  onPress={() => onSelectCity(c)}
                >
                  <Text style={[styles.pillChipText, { fontFamily: sansFont }, selectedCity === c && styles.activePillText]}>
                    {c === 'All' ? '🌐 All Triangle' : `📍 ${c}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Category Section */}
            <Text style={[styles.sectionTitle, { fontFamily: sansFont }]}>Category</Text>
            <View style={styles.grid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.pillChip, selectedCategory === cat && styles.activePillChip]}
                  onPress={() => onSelectCategory(cat)}
                >
                  <Text style={[styles.pillChipText, { fontFamily: sansFont }, selectedCategory === cat && styles.activePillText]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Price Option */}
            <Text style={[styles.sectionTitle, { fontFamily: sansFont }]}>Price</Text>
            <TouchableOpacity
              style={[styles.priceRow, freeOnly && styles.activePriceRow]}
              onPress={onToggleFreeOnly}
            >
              <Text style={[styles.priceRowText, { fontFamily: sansFont }, freeOnly && styles.activePriceText]}>
                {freeOnly ? '✓ Free Items Only' : 'Show All Prices (Free + Paid)'}
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Bottom Actions */}
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.resetBtn} onPress={onReset}>
              <Text style={[styles.resetBtnText, { fontFamily: sansFont }]}>Reset All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={onClose}>
              <Text style={[styles.applyBtnText, { fontFamily: sansFont }]}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 26, 0.6)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    maxHeight: '85%',
    padding: 20,
    borderWidth: 1.5,
    borderColor: colors.ink,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.ticketBorder,
  },
  closeBtnText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.coral,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pillChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.ticketBorder,
  },
  activePillChip: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  pillChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink,
  },
  activePillText: {
    color: colors.paper,
  },
  priceRow: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: colors.ticketBorder,
    alignItems: 'center',
  },
  activePriceRow: {
    backgroundColor: '#D1EBE7',
    borderColor: colors.forest,
  },
  priceRowText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  activePriceText: {
    color: colors.forest,
  },
  bottomBar: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.ticketBorder,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: radii.button,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.ticketBorder,
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.muted,
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 11,
    borderRadius: radii.button,
    alignItems: 'center',
    backgroundColor: colors.ink,
  },
  applyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.paper,
  },
});
