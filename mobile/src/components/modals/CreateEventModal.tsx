import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Image, ActivityIndicator } from 'react-native';
import { EventCreatePayload } from '../../types';
import { colors, radii } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { fetchPlaceAutocomplete, resolveVenuePhoto, PlaceSuggestion } from '../../services/api';

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
  const [imageUrl, setImageUrl] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);

  // Autocomplete search as user types venue name
  useEffect(() => {
    if (!venueName.trim() || venueName.length < 2) {
      setPlaceSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingPlaces(true);
      const suggestions = await fetchPlaceAutocomplete(venueName);
      setPlaceSuggestions(suggestions);
      setIsSearchingPlaces(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [venueName]);

  const handleSelectSuggestion = (s: PlaceSuggestion) => {
    setVenueName(s.venue_name);
    setAddress(s.address);
    setCity(s.city);
    setCategory(s.category);
    setImageUrl(s.image_url);
    setPlaceSuggestions([]);
  };

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

      // Automatically resolve real venue picture if user didn't manually pick one
      let finalPhoto = imageUrl.trim();
      if (!finalPhoto) {
        finalPhoto = await resolveVenuePhoto(venueName.trim(), city, category);
      }

      await onSubmit({
        title: title.trim(),
        city,
        venue_name: venueName.trim(),
        address: address.trim() || undefined,
        category,
        description: description.trim() || undefined,
        image_url: finalPhoto,
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
      setImageUrl('');
      setPlaceSuggestions([]);
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

            {/* Venue Search with Maps Autocomplete */}
            <Text style={styles.label}>Venue / Meeting Location (Maps Search) *</Text>
            <View style={styles.inputWithSpinner}>
              <TextInput
                style={styles.input}
                placeholder="Type venue (e.g. Fullsteam, Boxcar, Morgan St, DBAP)..."
                placeholderTextColor={colors.muted}
                value={venueName}
                onChangeText={setVenueName}
              />
              {isSearchingPlaces ? (
                <View style={styles.spinnerIcon}>
                  <ActivityIndicator size="small" color={colors.coral} />
                </View>
              ) : null}
            </View>

            {/* Place Autocomplete Suggestions Dropdown */}
            {placeSuggestions.length > 0 ? (
              <View style={styles.suggestionsBox}>
                <Text style={styles.suggestionsHeader}>📍 Tap to Auto-Fill Address & Venue Photo:</Text>
                {placeSuggestions.map((s, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.suggestionRow}
                    onPress={() => handleSelectSuggestion(s)}
                  >
                    <Image source={{ uri: s.image_url }} style={styles.suggestionThumb} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.suggestionTitle}>{s.venue_name}</Text>
                      <Text style={styles.suggestionSub}>{s.address} · {s.city}</Text>
                    </View>
                    <Text style={styles.autoFillBadge}>Auto-Fill ↵</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

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

            <Text style={styles.label}>Venue / Event Photo (Auto-populated or Custom URL)</Text>
            {imageUrl ? (
              <View style={styles.previewImageFrame}>
                <Image source={{ uri: imageUrl }} style={styles.previewImage} resizeMode="cover" />
                <Text style={styles.previewBadge}>✓ Real Venue Picture Ready</Text>
              </View>
            ) : null}

            <TextInput
              style={styles.input}
              placeholder="Auto-resolved on post, or paste custom photo URL..."
              placeholderTextColor={colors.muted}
              value={imageUrl}
              onChangeText={setImageUrl}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: 6, marginTop: 4, marginBottom: 12 }}>
              {[
                { label: '⚾ Stadium', url: 'https://images.unsplash.com/photo-1508344928928-7165b67de128?w=800' },
                { label: '🍺 Brewery', url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800' },
                { label: '🕹 Arcade', url: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=800' },
                { label: '🌮 Food Hall', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800' },
                { label: '🎨 Art Museum', url: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=800' },
                { label: '🌲 Park Trail', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800' },
              ].map((p) => (
                <TouchableOpacity
                  key={p.label}
                  style={[styles.chip, imageUrl === p.url && styles.activeChip]}
                  onPress={() => setImageUrl(p.url)}
                >
                  <Text style={[styles.chipText, imageUrl === p.url && styles.activeChipText]}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

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
              <View style={styles.priceInputBox}>
                <Text style={styles.label}>Ticket Price ($ USD)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="e.g. 15"
                  placeholderTextColor={colors.muted}
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
            ) : null}

            <Text style={styles.label}>Description / Details</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline={true}
              numberOfLines={4}
              placeholder="What's the plan? Where are people meeting?"
              placeholderTextColor={colors.muted}
              value={description}
              onChangeText={setDescription}
            />
          </ScrollView>

          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && styles.disabledBtn]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitBtnText}>{isSubmitting ? 'Publishing Plan...' : 'Post Plan →'}</Text>
          </TouchableOpacity>
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
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    maxHeight: '90%',
    padding: 20,
    borderWidth: 1.5,
    borderColor: colors.ink,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink,
    fontFamily: typography.displayFont,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderRule,
  },
  closeBtnText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  formScroll: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.coral,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 6,
    fontFamily: typography.sansFont,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.ink,
    borderRadius: radii.button,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.borderRule,
    fontFamily: typography.sansFont,
  },
  inputWithSpinner: {
    position: 'relative',
  },
  spinnerIcon: {
    position: 'absolute',
    right: 12,
    top: 10,
  },
  // Suggestions
  suggestionsBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.button,
    padding: 8,
    marginTop: 6,
    borderWidth: 1.5,
    borderColor: colors.coral,
  },
  suggestionsHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.forest,
    letterSpacing: 0.8,
    marginBottom: 6,
    fontFamily: typography.sansFont,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.paper,
    padding: 8,
    borderRadius: radii.button,
    marginBottom: 4,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.borderRule,
  },
  suggestionThumb: {
    width: 36,
    height: 36,
    borderRadius: 6,
  },
  suggestionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
    fontFamily: typography.sansFont,
  },
  suggestionSub: {
    fontSize: 11,
    color: colors.muted,
    fontFamily: typography.sansFont,
  },
  autoFillBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.coral,
    backgroundColor: colors.sand,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    fontFamily: typography.sansFont,
  },
  // Image preview
  previewImageFrame: {
    height: 100,
    borderRadius: radii.button,
    overflow: 'hidden',
    marginBottom: 8,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: colors.forest,
    color: colors.paper,
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  chip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: colors.borderRule,
  },
  activeChip: {
    backgroundColor: colors.sand,
    borderColor: colors.coral,
  },
  chipText: {
    fontSize: 12,
    color: colors.ink,
    fontWeight: '600',
    fontFamily: typography.sansFont,
  },
  activeChipText: {
    fontWeight: '800',
    color: colors.ink,
  },
  priceRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  priceToggle: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 10,
    borderRadius: radii.button,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderRule,
  },
  activePriceToggle: {
    backgroundColor: colors.sand,
    borderColor: colors.coral,
  },
  priceToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
    fontFamily: typography.sansFont,
  },
  activePriceText: {
    color: colors.ink,
    fontWeight: '800',
  },
  priceInputBox: {
    marginTop: 4,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: colors.ink,
    paddingVertical: 14,
    borderRadius: radii.button,
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: colors.paper,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: typography.sansFont,
  },
});
