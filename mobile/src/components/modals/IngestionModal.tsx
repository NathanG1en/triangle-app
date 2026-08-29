import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { colors, radii } from '../../theme/colors';
import { useFontTheme } from '../../theme/typography';
import { fetchIngestionSources, triggerLiveIngestion, IngestionSourceStatus } from '../../services/api';

interface IngestionModalProps {
  visible: boolean;
  onClose: () => void;
  onIngestionComplete: (count: number) => void;
}

export const IngestionModal: React.FC<IngestionModalProps> = ({
  visible,
  onClose,
  onIngestionComplete,
}) => {
  const { displayFont, sansFont } = useFontTheme();
  const [sources, setSources] = useState<IngestionSourceStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [running, setRunning] = useState<boolean>(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadSources();
    }
  }, [visible]);

  const loadSources = async () => {
    setLoading(true);
    try {
      const data = await fetchIngestionSources();
      setSources(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunIngestion = async () => {
    setRunning(true);
    setResultMsg(null);
    try {
      const res = await triggerLiveIngestion();
      const count = res.total_ingested || 0;
      setResultMsg(`Successfully scraped ${res.sources_scraped} sources! Ingested & curated ${count} new Triangle events.`);
      await loadSources();
      onIngestionComplete(count);
    } catch (err) {
      setResultMsg('Failed to run live ingestion. Please check backend connection.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.eyebrow, { fontFamily: sansFont }]}>LIVE INGESTION PIPELINE</Text>
              <Text style={[styles.title, { fontFamily: displayFont }]}>Triangle Event Sources</Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {resultMsg ? (
            <View style={styles.resultBox}>
              <Text style={[styles.resultText, { fontFamily: sansFont }]}>{resultMsg}</Text>
            </View>
          ) : null}

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionHeading, { fontFamily: sansFont }]}>Active Scraper Connections</Text>

            {loading ? (
              <ActivityIndicator color={colors.ink} style={{ marginVertical: 20 }} />
            ) : (
              sources.map((src, idx) => (
                <View key={src.source_name + idx} style={styles.sourceRow}>
                  <View style={styles.sourceInfo}>
                    <View style={styles.sourceTitleRow}>
                      <View style={styles.statusDot} />
                      <Text style={[styles.sourceName, { fontFamily: displayFont }]}>{src.source_name}</Text>
                    </View>
                    <Text style={[styles.sourceMeta, { fontFamily: sansFont }]}>
                      {src.base_url} · {src.events_count} events indexed
                    </Text>
                  </View>

                  <Text style={[styles.statusBadge, { fontFamily: sansFont }]}>ACTIVE</Text>
                </View>
              ))
            )}

            <View style={styles.infoBox}>
              <Text style={[styles.infoTitle, { fontFamily: displayFont }]}>How Ingestion Works</Text>
              <Text style={[styles.infoBody, { fontFamily: sansFont }]}>
                Triangle Social continuously scrapes RSS feeds, newsletters, and local culture guides across Durham, Raleigh, Chapel Hill, Cary, and Morrisville. Our pipeline normalizes dates, extracts high-res photography, and deduplicates listings.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.runBtn, running && styles.runBtnDisabled]}
              onPress={handleRunIngestion}
              disabled={running}
            >
              {running ? (
                <ActivityIndicator color={colors.paper} size="small" />
              ) : (
                <Text style={[styles.runBtnText, { fontFamily: sansFont }]}>⚡ Run Ingestion Engine Now</Text>
              )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
    maxHeight: '85%',
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderRule,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.coral,
    letterSpacing: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.ink,
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    fontSize: 18,
    color: colors.muted,
  },
  resultBox: {
    backgroundColor: colors.sand,
    padding: 10,
    borderRadius: radii.button,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: colors.coral,
  },
  resultText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'center',
  },
  content: {
    marginVertical: 12,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderRule,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.forest,
  },
  sourceName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
  },
  sourceMeta: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.forest,
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  infoBox: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: radii.button,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.borderRule,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 4,
  },
  infoBody: {
    fontSize: 12,
    color: colors.muted,
    lineHeight: 17,
  },
  footer: {
    marginTop: 12,
  },
  runBtn: {
    backgroundColor: colors.ink,
    paddingVertical: 12,
    borderRadius: radii.button,
    alignItems: 'center',
  },
  runBtnDisabled: {
    opacity: 0.6,
  },
  runBtnText: {
    color: colors.paper,
    fontSize: 13,
    fontWeight: '700',
  },
});
