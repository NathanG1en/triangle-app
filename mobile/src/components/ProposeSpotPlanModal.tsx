import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { EventItem, EventCreatePayload } from '../types';
import { colors, radii } from '../theme/colors';
import { useFontTheme } from '../theme/typography';

type RecurrenceRule = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | null;

interface ProposeSpotPlanModalProps {
  spot: EventItem | null;
  visible: boolean;
  onClose: () => void;
  onPlanScheduled: (createdEvent: EventItem) => void;
}

function formatYYYYMMDD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseCustomTimeString(timeStr: string): { hour: number; min: number } {
  const clean = timeStr.trim().toLowerCase();
  const isPM = clean.includes('pm');
  const isAM = clean.includes('am');
  const numOnly = clean.replace(/(am|pm|\s)/g, '');

  if (numOnly.includes(':')) {
    const parts = numOnly.split(':');
    let h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) || 0;
    if (isNaN(h)) return { hour: 19, min: 0 };
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    return { hour: Math.min(23, Math.max(0, h)), min: Math.min(59, Math.max(0, m)) };
  } else {
    let h = parseInt(numOnly, 10);
    if (isNaN(h)) return { hour: 19, min: 0 };
    if (isPM && h < 12) h += 12;
    if (isAM && h === 12) h = 0;
    return { hour: Math.min(23, Math.max(0, h)), min: 0 };
  }
}

const RECURRENCE_OPTIONS: { id: RecurrenceRule; label: string; sub: string }[] = [
  { id: null,       label: 'One-time',   sub: 'Just this date' },
  { id: 'WEEKLY',   label: 'Weekly',     sub: 'Same day every week' },
  { id: 'BIWEEKLY', label: 'Every 2 Weeks', sub: 'Same day, every other week' },
  { id: 'MONTHLY',  label: 'Monthly',    sub: 'Same date each month' },
];

function recurrencePreviewLabel(rule: RecurrenceRule, dateStr: string, timeStr: string): string | null {
  if (!rule) return null;
  const base = new Date(dateStr);
  if (isNaN(base.getTime())) return null;
  const { hour, min } = parseCustomTimeString(timeStr);
  base.setHours(hour, min, 0, 0);

  const dayName = base.toLocaleDateString('en-US', { weekday: 'long' });
  const timeLabel = base.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  if (rule === 'WEEKLY') return `Every ${dayName} at ${timeLabel}`;
  if (rule === 'BIWEEKLY') return `Every other ${dayName} at ${timeLabel}`;
  if (rule === 'MONTHLY') {
    const day = base.getDate();
    const ordinal = day === 1 ? '1st' : day === 2 ? '2nd' : day === 3 ? '3rd' : `${day}th`;
    return `The ${ordinal} of each month at ${timeLabel}`;
  }
  return null;
}

export const ProposeSpotPlanModal: React.FC<ProposeSpotPlanModalProps> = ({
  spot,
  visible,
  onClose,
  onPlanScheduled,
}) => {
  const { displayFont, sansFont } = useFontTheme();

  const [planTitle, setPlanTitle] = useState<string>('');
  const [customDateInput, setCustomDateInput] = useState<string>('');
  const [customTimeInput, setCustomTimeInput] = useState<string>('8:30 PM');
  const [planNote, setPlanNote] = useState<string>('');
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (spot) {
      const today = new Date();
      setPlanTitle(`Cohort Meetup at ${spot.title}`);
      setPlanNote(`Organizing a group hangout at ${spot.venue_name || spot.title}. Meet at the main area/patio!`);
      setCustomDateInput(formatYYYYMMDD(today));
      setCustomTimeInput('8:30 PM');
      setRecurrenceRule(null);
    }
  }, [spot]);

  if (!visible || !spot) return null;

  const dayPresets = [
    { label: 'Today', getDate: () => new Date() },
    { label: 'Tomorrow', getDate: () => { const d = new Date(); d.setDate(d.getDate() + 1); return d; } },
    { label: 'This Sat', getDate: () => { const d = new Date(); d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7)); return d; } },
    { label: 'This Sun', getDate: () => { const d = new Date(); d.setDate(d.getDate() + ((0 - d.getDay() + 7) % 7 || 7)); return d; } },
  ];

  const timePresets = [
    { label: '12:00 PM', timeStr: '12:00 PM' },
    { label: '2:00 PM',  timeStr: '2:00 PM'  },
    { label: '6:30 PM',  timeStr: '6:30 PM'  },
    { label: '8:30 PM',  timeStr: '8:30 PM'  },
  ];

  const getParsedTargetDate = (): Date => {
    let baseDate = new Date();
    if (customDateInput.trim()) {
      const parsed = new Date(customDateInput);
      if (!isNaN(parsed.getTime())) baseDate = parsed;
    }
    const { hour, min } = parseCustomTimeString(customTimeInput);
    baseDate.setHours(hour, min, 0, 0);
    return baseDate;
  };

  const handleScheduleSubmit = async () => {
    if (!planTitle.trim()) {
      alert('Please enter a title for this scheduled plan.');
      return;
    }
    setSubmitting(true);
    try {
      const targetDate = getParsedTargetDate();
      const payload: EventCreatePayload = {
        title: planTitle,
        description: planNote,
        venue_name: spot.venue_name || spot.title,
        address: spot.address,
        city: spot.city,
        start_at: targetDate.toISOString(),
        category: spot.category || 'Social',
        price_min: spot.price_min || 0,
        price_max: spot.price_max || 0,
        is_free: spot.is_free ?? true,
        is_suggestion: false,
        image_url: spot.image_url,
        source_name: 'Cohort Scheduled Spot',
        source_url: spot.source_url,
        recurrence_rule: recurrenceRule,
      };

      const { createCommunityEvent } = require('../services/api');
      const createdEvent = await createCommunityEvent(payload);
      setSubmitting(false);
      onPlanScheduled(createdEvent);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      alert('Failed to schedule spot plan. Please try again.');
    }
  };

  const targetDateObj = getParsedTargetDate();
  const formattedSummary = targetDateObj.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
  const recurrencePreview = recurrencePreviewLabel(recurrenceRule, customDateInput, customTimeInput);

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* Header */}
          <View style={styles.topRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { fontFamily: displayFont }]}>Propose Scheduled Hangout</Text>
              <Text style={[styles.spotSub, { fontFamily: sansFont }]} numberOfLines={1}>
                {spot.title} · {spot.city}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Title */}
            <Text style={[styles.inputLabel, { fontFamily: sansFont }]}>Plan Name</Text>
            <TextInput
              style={[styles.textInput, { fontFamily: sansFont }]}
              value={planTitle}
              onChangeText={setPlanTitle}
              placeholder="e.g. Saturday Tacos at Morgan Street Food Hall"
              placeholderTextColor={colors.muted}
            />

            {/* Date */}
            <Text style={[styles.inputLabel, { fontFamily: sansFont }]}>Date (Type custom or tap preset)</Text>
            <View style={styles.inputWithPresets}>
              <TextInput
                style={[styles.textInput, { fontFamily: sansFont, fontWeight: '700' }]}
                value={customDateInput}
                onChangeText={setCustomDateInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.muted}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsRow}>
                {dayPresets.map((opt) => (
                  <TouchableOpacity
                    key={opt.label}
                    style={styles.presetChip}
                    onPress={() => setCustomDateInput(formatYYYYMMDD(opt.getDate()))}
                  >
                    <Text style={[styles.presetChipText, { fontFamily: sansFont }]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Time */}
            <Text style={[styles.inputLabel, { fontFamily: sansFont }]}>Exact Time (Type custom or tap preset)</Text>
            <View style={styles.inputWithPresets}>
              <TextInput
                style={[styles.textInput, { fontFamily: sansFont, fontWeight: '700' }]}
                value={customTimeInput}
                onChangeText={setCustomTimeInput}
                placeholder="e.g. 7:15 PM, 8:30 PM"
                placeholderTextColor={colors.muted}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsRow}>
                {timePresets.map((opt) => (
                  <TouchableOpacity
                    key={opt.label}
                    style={styles.presetChip}
                    onPress={() => setCustomTimeInput(opt.timeStr)}
                  >
                    <Text style={[styles.presetChipText, { fontFamily: sansFont }]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* ── Recurrence Picker ─────────────────────────────────────────────── */}
            <Text style={[styles.inputLabel, { fontFamily: sansFont }]}>Make This Recurring?</Text>
            <View style={styles.recurrenceGrid}>
              {RECURRENCE_OPTIONS.map((opt) => {
                const isSelected = recurrenceRule === opt.id;
                return (
                  <TouchableOpacity
                    key={String(opt.id)}
                    style={[styles.recurrenceCard, isSelected && styles.recurrenceCardActive]}
                    onPress={() => setRecurrenceRule(opt.id)}
                  >
                    <Text style={[styles.recurrenceLabel, { fontFamily: sansFont }, isSelected && styles.recurrenceLabelActive]}>
                      {opt.label}
                    </Text>
                    <Text style={[styles.recurrenceSub, { fontFamily: sansFont }, isSelected && styles.recurrenceSubActive]}>
                      {opt.sub}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Recap badge */}
            <View style={[styles.summaryBadge, recurrenceRule && styles.summaryBadgeRecurring]}>
              <Text style={[styles.summaryLabel, { fontFamily: sansFont }]}>
                {recurrenceRule ? 'RECURRING SCHEDULE:' : 'SCHEDULED TIME FOR CALENDAR:'}
              </Text>
              <Text style={[styles.summaryDate, { fontFamily: sansFont }, recurrenceRule && styles.summaryDateRecurring]}>
                {recurrencePreview ? `🔁 ${recurrencePreview}` : `⏰ ${formattedSummary}`}
              </Text>
              {recurrenceRule && (
                <Text style={[styles.summaryNext, { fontFamily: sansFont }]}>
                  First occurrence: {formattedSummary} · Next 3 dates auto-created
                </Text>
              )}
            </View>

            {/* Message */}
            <Text style={[styles.inputLabel, { fontFamily: sansFont }]}>Message for Cohort (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea, { fontFamily: sansFont }]}
              value={planNote}
              onChangeText={setPlanNote}
              multiline={true}
              numberOfLines={3}
              placeholder="e.g. Grab food from any stall, we'll grab the large patio table!"
              placeholderTextColor={colors.muted}
            />
          </ScrollView>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            disabled={submitting}
            onPress={handleScheduleSubmit}
          >
            {submitting ? (
              <ActivityIndicator color={colors.paper} size="small" />
            ) : (
              <Text style={[styles.submitBtnText, { fontFamily: sansFont }]}>
                {recurrenceRule ? '🔁 Post Recurring Plan & Add to Calendar →' : '📅 Post Plan & Add to Calendar →'}
              </Text>
            )}
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
  modalBox: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    maxHeight: '92%',
    padding: 20,
    borderWidth: 1.5,
    borderColor: colors.ink,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink,
  },
  spotSub: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.coral,
    marginTop: 1,
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
  closeBtnText: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  scrollContent: { marginBottom: 16 },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.coral,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 14,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: colors.surface,
    color: colors.ink,
    borderRadius: radii.button,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.borderRule,
  },
  inputWithPresets: { gap: 8 },
  presetsRow: { flexDirection: 'row', gap: 6 },
  presetChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: colors.borderRule,
  },
  presetChipText: { fontSize: 11, fontWeight: '600', color: colors.ink },
  // Recurrence
  recurrenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  recurrenceCard: {
    flex: 1,
    minWidth: '44%',
    backgroundColor: colors.surface,
    borderRadius: radii.button,
    borderWidth: 1,
    borderColor: colors.borderRule,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  recurrenceCardActive: {
    backgroundColor: colors.sand,
    borderColor: colors.coral,
    borderWidth: 2,
  },
  recurrenceLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
  },
  recurrenceLabelActive: {
    color: colors.ink,
  },
  recurrenceSub: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 2,
  },
  recurrenceSubActive: {
    color: colors.coral,
    fontWeight: '700',
  },
  // Summary badge
  summaryBadge: {
    backgroundColor: colors.surface,
    borderRadius: radii.button,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.borderRule,
  },
  summaryBadgeRecurring: {
    backgroundColor: colors.sand,
    borderColor: colors.coral,
    borderWidth: 1.5,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.muted,
    letterSpacing: 0.8,
  },
  summaryDate: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.forest,
    marginTop: 3,
  },
  summaryDateRecurring: {
    color: colors.ink,
  },
  summaryNext: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 4,
    fontStyle: 'italic',
  },
  textArea: { height: 70, textAlignVertical: 'top' },
  submitBtn: {
    backgroundColor: colors.ink,
    paddingVertical: 13,
    borderRadius: radii.button,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: colors.paper, fontSize: 14, fontWeight: '700' },
});
