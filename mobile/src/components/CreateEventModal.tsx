import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { EventCreatePayload } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface CreateEventModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: EventCreatePayload) => Promise<void>;
}

const CITIES = ['Cary', 'Morrisville', 'Raleigh', 'Durham', 'Chapel Hill'];
const CATEGORIES = ['Social', 'Food & Drink', 'Outdoor & Fitness', 'Tech & Professional', 'Arts & Music', 'Sports'];

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ visible, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [city, setCity] = useState('Cary');
  const [venueName, setVenueName] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('Social');
  const [description, setDescription] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('Please enter an event title');
      return;
    }
    if (!venueName.trim()) {
      alert('Please enter a venue or location name');
      return;
    }

    setIsSubmitting(true);
    try {
      const defaultDate = new Date(Date.now() + 3600 * 1000 * 24).toISOString();
      const numPrice = isFree ? 0 : parseFloat(price) || 0;

      await onSubmit({
        title: title.trim(),
        city,
        venue_name: venueName.trim(),
        address: address.trim() || undefined,
        category,
        description: description.trim() || undefined,
        start_at: defaultDate,
        is_free: isFree,
        price_min: numPrice,
        price_max: numPrice,
        source_name: 'Cohort Member',
      });

      setTitle('');
      setVenueName('');
      setAddress('');
      setDescription('');
      onClose();
    } catch (err) {
      alert('Failed to post event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.topBar}>
            <Text style={styles.headerTitle}>Post a Plan for Your Cohort</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Plan Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Downtown Cary Sunset Board Games"
              placeholderTextColor={colors.muted}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Triangle Hub / City *</Text>
            <View style={styles.chipRow}>
              {CITIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.chip, city === c && styles.activeChip]}
                  onPress={() => setCity(c)}
                >
                  <Text style={[styles.chipText, city === c && styles.activeChipText]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Venue / Meeting Location *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Downtown Cary Park Lawn / Morgan St Food Hall"
              placeholderTextColor={colors.muted}
              value={venueName}
              onChangeText={setVenueName}
            />

            <Text style={styles.label}>Street Address (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 327 S Academy St"
              placeholderTextColor={colors.muted}
              value={address}
              onChangeText={setAddress}
            />

            <Text style={styles.label}>Category</Text>
            <View style={styles.chipRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, category === cat && styles.activeChip]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.chipText, category === cat && styles.activeChipText]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.priceRow}>
              <TouchableOpacity
                style={[styles.priceToggle, isFree && styles.activePriceToggle]}
                onPress={() => setIsFree(true)}
              >
                <Text style={[styles.priceToggleText, isFree && styles.activePriceText]}>Free Event</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.priceToggle, !isFree && styles.activePriceToggle]}
                onPress={() => setIsFree(false)}
              >
                <Text style={[styles.priceToggleText, !isFree && styles.activePriceText]}>Paid Event</Text>
              </TouchableOpacity>
            </View>

            {!isFree ? (
              <View>
                <Text style={styles.label}>Estimated Cost ($)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="15"
                  placeholderTextColor={colors.muted}
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
            ) : null}

            <Text style={styles.label}>Description & Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Details about where to gather, parking recommendations, or what to bring..."
              placeholderTextColor={colors.muted}
              multiline={true}
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />

            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && styles.disabledBtn]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitBtnText}>{isSubmitting ? 'Posting...' : 'Publish Plan to Cohort'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 26, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    padding: 20,
    borderWidth: 1.5,
    borderColor: colors.ink,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerTitle: {
    fontFamily: typography.displayFont,
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
  formScroll: {
    paddingBottom: 24,
  },
  label: {
    fontFamily: typography.sansFont,
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.ink,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.ticketBorder,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.ticketBorder,
  },
  activeChip: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  chipText: {
    fontFamily: typography.sansFont,
    color: colors.ink,
    fontSize: 12,
    fontWeight: '600',
  },
  activeChipText: {
    color: colors.paper,
  },
  priceRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    marginBottom: 6,
  },
  priceToggle: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.ticketBorder,
  },
  activePriceToggle: {
    backgroundColor: colors.sand,
    borderColor: colors.coral,
  },
  priceToggleText: {
    fontFamily: typography.sansFont,
    color: colors.ink,
    fontSize: 12,
    fontWeight: '700',
  },
  activePriceText: {
    color: colors.ink,
  },
  submitBtn: {
    backgroundColor: colors.ink,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 20,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontFamily: typography.sansFont,
    color: colors.paper,
    fontSize: 14,
    fontWeight: '800',
  },
});
