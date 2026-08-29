import React, { useEffect, useRef, useState } from 'react';
import type { EventItem } from '../types';
import L from 'leaflet';

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
  'eno river state park': { lat: 36.0708, lng: -79.0033 },
  // Raleigh
  'morgan street food hall': { lat: 35.7794, lng: -78.6456 },
  'transfer co. food hall': { lat: 35.7738, lng: -78.6300 },
  'raleigh beer garden': { lat: 35.7866, lng: -78.6485 },
  'ncma museum park': { lat: 35.8092, lng: -78.7028 },
  'moore square park': { lat: 35.7766, lng: -78.6365 },
  'warehouse district raleigh': { lat: 35.7760, lng: -78.6476 },
  'lincoln theatre': { lat: 35.7764, lng: -78.6388 },
  'lake johnson park': { lat: 35.7386, lng: -78.7114 },
  'dorothea dix park': { lat: 35.7700, lng: -78.6550 },
  'umstead state park': { lat: 35.8614, lng: -78.7517 },
  // Chapel Hill / Carrboro
  'epilogue books': { lat: 35.9132, lng: -79.0558 },
  'weaver street market lawn': { lat: 35.9100, lng: -79.0752 },
  // Cary
  'downtown cary park': { lat: 35.7915, lng: -78.7811 },
  'cary town hall campus': { lat: 35.7915, lng: -78.7811 },
  'fenton square lawn': { lat: 35.7730, lng: -78.7380 },
  // Morrisville
  'morrisville community park': { lat: 35.8235, lng: -78.8254 },
};

const CITY_CENTERS: Record<string, { lat: number; lng: number }> = {
  'Durham': { lat: 35.9940, lng: -78.8986 },
  'Raleigh': { lat: 35.7796, lng: -78.6382 },
  'Chapel Hill': { lat: 35.9132, lng: -79.0558 },
  'Carrboro': { lat: 35.9100, lng: -79.0752 },
  'Cary': { lat: 35.7915, lng: -78.7811 },
  'Morrisville': { lat: 35.8235, lng: -78.8254 },
};

function getEventCoords(event: EventItem): { lat: number; lng: number } {
  const venueLower = (event.venue_name || '').toLowerCase();
  if (VENUE_COORDS[venueLower]) return VENUE_COORDS[venueLower];

  for (const [key, coords] of Object.entries(VENUE_COORDS)) {
    if (venueLower.includes(key) || key.includes(venueLower)) return coords;
  }

  return CITY_CENTERS[event.city] || { lat: 35.87, lng: -78.78 };
}

// Custom "Sexy Editorial Warm Sand & Dark Ink" Google Maps Style Theme
const SEXY_GOOGLE_MAP_STYLE: any[] = [
  { elementType: "geometry", stylers: [{ color: "#F5F1EC" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#504C48" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#F5F1EC" }] },
  { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#BDBDBD" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#EBE5DD" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#77736F" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#E1D7CC" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#075E59" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#FFFEFD" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#E5E0D8" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#504C48" }] },
  { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#E0E0E0" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#D1E2DF" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#075E59" }] }
];

interface EventMapViewProps {
  events: EventItem[];
  onSelectEvent: (event: EventItem) => void;
  fullHeight?: boolean;
}

declare global {
  interface Window {
    google?: any;
    initGoogleMap?: () => void;
  }
}

export const EventMapView: React.FC<EventMapViewProps> = ({ events, onSelectEvent, fullHeight = false }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const googleMarkersRef = useRef<any[]>([]);
  const leafletMapRef = useRef<L.Map | null>(null);

  const [googleLoaded, setGoogleLoaded] = useState<boolean>(false);

  // Automatically attempt to load Google Maps JavaScript API
  useEffect(() => {
    if (window.google && window.google.maps) {
      setGoogleLoaded(true);
      return;
    }

    const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey.includes('your_google_maps')) {
      setGoogleLoaded(false);
      return;
    }

    const scriptId = 'google-maps-js-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setGoogleLoaded(true);
      script.onerror = () => setGoogleLoaded(false);
      document.head.appendChild(script);
    }
  }, []);

  // Primary Renderer: Google Maps
  useEffect(() => {
    if (!googleLoaded || !mapContainerRef.current || !window.google?.maps) return;

    if (!googleMapRef.current) {
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: { lat: 35.87, lng: -78.78 },
        zoom: 10,
        styles: SEXY_GOOGLE_MAP_STYLE,
        disableDefaultUI: true,
        zoomControl: true,
        clickableIcons: false,
      });
      googleMapRef.current = map;
    }

    const map = googleMapRef.current;

    // Clear previous Google markers
    googleMarkersRef.current.forEach((m) => m.setMap(null));
    googleMarkersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();

    events.forEach((event) => {
      const coords = getEventCoords(event);
      const position = { lat: coords.lat, lng: coords.lng };
      bounds.extend(position);

      const isSpot = event.is_suggestion || event.source_type === 'SUGGESTION';
      const pinColor = isSpot ? '#075E59' : '#D95F4B';
      const category = (event.category || 'SOCIAL').toUpperCase();
      const priceLabel = event.is_free ? 'FREE' : `$${event.price_min}`;

      const svgIcon = {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: pinColor,
        fillOpacity: 0.95,
        scale: 9,
        strokeColor: '#1A1A1A',
        strokeWeight: 2,
      };

      const marker = new window.google.maps.Marker({
        position,
        map,
        title: event.title,
        icon: svgIcon,
      });

      const infoContent = document.createElement('div');
      infoContent.className = 'google-popup';
      infoContent.innerHTML = `
        <div style="font-family: 'Outfit', sans-serif; min-width: 190px; padding: 2px;">
          <div style="font-size:10px;font-weight:800;letter-spacing:0.8px;color:${pinColor};margin-bottom:3px;">
            ${category} · ${event.city.toUpperCase()}
          </div>
          <div style="font-size:13px;font-weight:700;color:#1A1A1A;margin-bottom:3px;line-height:1.3;">
            ${event.title}
          </div>
          <div style="font-size:11px;color:#77736F;margin-bottom:6px;">
            📍 ${event.venue_name || event.city}
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px;">
            <span style="font-size:11px;font-weight:800;color:#1A1A1A;">${priceLabel}</span>
            <button id="gbtn-${event.id}" style="background:#1A1A1A;color:#FFFEFD;border:none;padding:5px 12px;border-radius:6px;font-size:10px;font-weight:700;cursor:pointer;">
              View →
            </button>
          </div>
        </div>
      `;

      const infoWindow = new window.google.maps.InfoWindow({
        content: infoContent,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        setTimeout(() => {
          const btn = document.getElementById(`gbtn-${event.id}`);
          if (btn) {
            btn.onclick = () => onSelectEvent(event);
          }
        }, 100);
      });

      googleMarkersRef.current.push(marker);
    });

    if (events.length > 0) {
      map.fitBounds(bounds);
    }
  }, [googleLoaded, events, onSelectEvent]);

  // Fallback Renderer: OpenStreetMap / Leaflet (Only if Google Maps API fails to load)
  useEffect(() => {
    if (googleLoaded || !mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, { zoomControl: true }).setView([35.87, -78.78], 10);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OSM · CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);
      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;
    map.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker) map.removeLayer(layer);
    });

    const latLngs: L.LatLngTuple[] = [];

    events.forEach((event) => {
      const coords = getEventCoords(event);
      latLngs.push([coords.lat, coords.lng]);

      const isSpot = event.is_suggestion || event.source_type === 'SUGGESTION';
      const pinColor = isSpot ? '#075E59' : '#D95F4B';

      const marker = L.circleMarker([coords.lat, coords.lng], {
        radius: 9,
        fillColor: pinColor,
        color: '#1A1A1A',
        weight: 1.5,
        fillOpacity: 0.9,
      }).addTo(map);

      const popupHtml = document.createElement('div');
      popupHtml.innerHTML = `
        <div style="font-family: 'Outfit', sans-serif; min-width: 190px; padding: 2px;">
          <div style="font-size:10px;font-weight:800;letter-spacing:0.8px;color:${pinColor};margin-bottom:3px;">
            ${(event.category || 'SOCIAL').toUpperCase()} · ${event.city.toUpperCase()}
          </div>
          <div style="font-size:13px;font-weight:700;color:#1A1A1A;margin-bottom:3px;line-height:1.3;">
            ${event.title}
          </div>
          <div style="font-size:11px;color:#77736F;margin-bottom:6px;">
            📍 ${event.venue_name || event.city}
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px;">
            <span style="font-size:11px;font-weight:800;color:#1A1A1A;">${event.is_free ? 'FREE' : `$${event.price_min}`}</span>
            <button id="lbtn-${event.id}" style="background:#1A1A1A;color:#FFFEFD;border:none;padding:5px 12px;border-radius:6px;font-size:10px;font-weight:700;cursor:pointer;">
              View →
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 240 });
      marker.on('popupopen', () => {
        const btn = document.getElementById(`lbtn-${event.id}`);
        if (btn) btn.onclick = () => onSelectEvent(event);
      });
    });

    if (latLngs.length > 0) {
      map.fitBounds(latLngs, { padding: [30, 30], maxZoom: 13 });
    }
  }, [googleLoaded, events, onSelectEvent]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Legend & Clean Map Header */}
      <div className="bg-[#F5F1EC] px-3.5 py-2.5 rounded-xl border border-[#E5E0D8] mb-2 flex items-center justify-between gap-2 text-[11px] font-bold">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D95F4B] border border-[#1A1A1A]"></span>
            <span>Timed Events</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#075E59] border border-[#1A1A1A]"></span>
            <span>Anytime Spots</span>
          </div>
        </div>

        <span className="text-[#77736F]">{events.length} Pinned</span>
      </div>

      {/* Map Canvas Container */}
      <div className={`w-full rounded-2xl overflow-hidden border border-[#E5E0D8] shadow-xs relative ${fullHeight ? 'h-[calc(100vh-210px)]' : 'h-[500px]'}`}>
        <div ref={mapContainerRef} className="w-full h-full z-10" />
      </div>
    </div>
  );
};
