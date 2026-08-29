import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { EventItem } from '../../types';
import { colors, radii } from '../../theme/colors';
import { useFontTheme } from '../../theme/typography';

// Known Triangle venue lat/lng lookup table (no geocoding API needed)
const VENUE_COORDS: Record<string, { lat: number; lng: number }> = {
  // Durham
  'durham central park': { lat: 35.9960, lng: -78.8986 },
  'durham bulls athletic park (dbap)': { lat: 35.9942, lng: -78.9019 },
  "cat's cradle": { lat: 35.9132, lng: -79.0553 },
  'motorco music hall': { lat: 35.9972, lng: -78.8968 },
  'dpac (durham performing arts center)': { lat: 35.9929, lng: -78.9005 },
  'boxcar bar + arcade': { lat: 35.9920, lng: -78.9066 },
  'ponysaurus brewing co.': { lat: 36.0013, lng: -78.8870 },
  'bull city running co.': { lat: 35.9962, lng: -78.9086 },
  'eno river state park (cole mill access)': { lat: 36.0708, lng: -79.0033 },
  // Raleigh
  'morgan street food hall': { lat: 35.7794, lng: -78.6456 },
  'transfer co. food hall': { lat: 35.7738, lng: -78.6300 },
  'raleigh beer garden': { lat: 35.7866, lng: -78.6485 },
  'ncma museum park': { lat: 35.8092, lng: -78.7028 },
  'ncma amphitheater & museum park': { lat: 35.8092, lng: -78.7028 },
  'ncma museum park trailhead': { lat: 35.8092, lng: -78.7028 },
  'moore square park': { lat: 35.7766, lng: -78.6365 },
  'warehouse district raleigh': { lat: 35.7760, lng: -78.6476 },
  'lincoln theatre': { lat: 35.7764, lng: -78.6388 },
  'downtown raleigh fayetteville st': { lat: 35.7796, lng: -78.6382 },
  'lake johnson park waterfront center': { lat: 35.7386, lng: -78.7114 },
  'dorothea dix park': { lat: 35.7700, lng: -78.6550 },
  'umstead state park (harrison ave entrance)': { lat: 35.8614, lng: -78.7517 },
  // Chapel Hill / Carrboro
  'epilogue books': { lat: 35.9132, lng: -79.0558 },
  'weaver street market lawn': { lat: 35.9100, lng: -79.0752 },
  // Cary
  'cary town hall campus': { lat: 35.7915, lng: -78.7811 },
  'fenton square lawn': { lat: 35.7380, lng: -78.7730 },
  // Morrisville
  'morrisville community park': { lat: 35.8235, lng: -78.8254 },
};

// Fallback: city center coords
const CITY_CENTERS: Record<string, { lat: number; lng: number }> = {
  'Durham': { lat: 35.9940, lng: -78.8986 },
  'Raleigh': { lat: 35.7796, lng: -78.6382 },
  'Chapel Hill': { lat: 35.9132, lng: -79.0558 },
  'Carrboro': { lat: 35.9100, lng: -79.0752 },
  'Cary': { lat: 35.7915, lng: -78.7811 },
  'Morrisville': { lat: 35.8235, lng: -78.8254 },
};

function getEventCoords(event: EventItem): { lat: number; lng: number } | null {
  const venueLower = (event.venue_name || '').toLowerCase();
  if (VENUE_COORDS[venueLower]) return VENUE_COORDS[venueLower];

  // Partial match
  for (const [key, coords] of Object.entries(VENUE_COORDS)) {
    if (venueLower.includes(key) || key.includes(venueLower)) return coords;
  }

  // Fallback to city center
  return CITY_CENTERS[event.city] || null;
}

interface MapViewProps {
  events: EventItem[];
  onSelectEvent: (event: EventItem) => void;
}

export const MapView: React.FC<MapViewProps> = ({ events, onSelectEvent }) => {
  const { displayFont, sansFont } = useFontTheme();

  const mappedEvents = useMemo(() => {
    return events
      .map((e) => ({ event: e, coords: getEventCoords(e) }))
      .filter((item): item is { event: EventItem; coords: { lat: number; lng: number } } => item.coords !== null);
  }, [events]);

  // Build Leaflet HTML for iframe
  const leafletHTML = useMemo(() => {
    const markers = mappedEvents.map(({ event, coords }, i) => {
      const isSpot = event.is_suggestion || event.source_type === 'SUGGESTION';
      const pinColor = isSpot ? '#075E59' : '#D95F4B';
      const label = event.title.replace(/'/g, "\\'").replace(/"/g, '&quot;');
      const venue = (event.venue_name || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
      const category = (event.category || '').toUpperCase();
      const timeLabel = isSpot
        ? 'ANYTIME SPOT'
        : new Date(event.start_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
      const priceLabel = event.is_free ? 'FREE' : `$${event.price_min}`;

      return `
        L.circleMarker([${coords.lat}, ${coords.lng}], {
          radius: 10,
          fillColor: '${pinColor}',
          color: '#1A1A1A',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        }).addTo(map)
          .bindPopup(\`<div style="font-family: 'Inter', system-ui, sans-serif; min-width: 200px;">
            <div style="font-size:11px;font-weight:800;letter-spacing:0.8px;color:${pinColor};margin-bottom:4px;">${category} · ${event.city.toUpperCase()}</div>
            <div style="font-size:14px;font-weight:700;color:#1A1A1A;margin-bottom:4px;">${label}</div>
            <div style="font-size:11px;color:#77736F;margin-bottom:2px;">${venue}</div>
            <div style="font-size:11px;color:${pinColor};font-weight:700;">${timeLabel}</div>
            <div style="font-size:11px;color:#1A1A1A;font-weight:800;margin-top:2px;">${priceLabel}</div>
            <div style="margin-top:8px;">
              <button onclick="window.parent.postMessage({type:'SELECT_EVENT',eventId:${event.id}},'*')"
                style="background:#1A1A1A;color:#FFFEFD;border:none;padding:6px 14px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;">
                View Details →
              </button>
            </div>
          </div>\`, { maxWidth: 260 });
      `;
    }).join('\n');

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  * { margin:0; padding:0; box-sizing: border-box; }
  html, body, #map { width:100%; height:100%; }
  .leaflet-popup-content-wrapper {
    border-radius: 12px !important;
    box-shadow: 0 4px 20px rgba(26,26,26,0.15) !important;
    border: 1px solid #E5E0D8 !important;
  }
  .leaflet-popup-tip { border-top-color: #FFFEFD !important; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map', { zoomControl: true }).setView([35.87, -78.78], 10);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a> · <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);

  ${markers}

  // Fit bounds to markers
  var allCoords = [${mappedEvents.map(({ coords }) => `[${coords.lat}, ${coords.lng}]`).join(',')}];
  if (allCoords.length > 0) {
    map.fitBounds(allCoords, { padding: [30, 30], maxZoom: 13 });
  }
</script>
</body>
</html>`;
  }, [mappedEvents]);

  return (
    <View style={styles.container}>
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.coral }]} />
          <Text style={[styles.legendText, { fontFamily: sansFont }]}>Timed Events</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.forest }]} />
          <Text style={[styles.legendText, { fontFamily: sansFont }]}>Anytime Spots</Text>
        </View>
        <Text style={[styles.legendCount, { fontFamily: sansFont }]}>
          {mappedEvents.length} pinned
        </Text>
      </View>

      {/* Leaflet Map via iframe */}
      <View style={styles.mapFrame}>
        <iframe
          srcDoc={leafletHTML}
          style={{ width: '100%', height: '100%', border: 'none', borderRadius: 16 }}
          title="Triangle Events Map"
          sandbox="allow-scripts allow-same-origin"
          onLoad={() => {
            // Listen for pin click → open detail modal
            const handler = (e: MessageEvent) => {
              if (e.data?.type === 'SELECT_EVENT') {
                const found = events.find((ev) => ev.id === e.data.eventId);
                if (found) onSelectEvent(found);
              }
            };
            if (Platform.OS === 'web' && typeof window !== 'undefined' && window.addEventListener) {
              window.addEventListener('message', handler);
            }
          }}
        />
      </View>
    </View>
  );
};

// Also set up the message listener at module level for reliability
if (typeof window !== 'undefined') {
  // Will be hooked up per-instance in DiscoverScreen
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.ink,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.muted,
  },
  legendCount: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.ink,
    marginLeft: 'auto',
  },
  mapFrame: {
    flex: 1,
    minHeight: 450,
    borderRadius: radii.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderRule,
    backgroundColor: colors.surface,
  },
});
