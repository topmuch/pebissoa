'use client';

/**
 * BissauMap — carte Leaflet auto-hébergée (JS bundlé, tuiles OSM chargées
 * en <img> — fonctionne même dans les environnements qui bloquent les iframes).
 * Marqueur sur le siège : Pluba - Curva de Djon Cubala, Bissau.
 */

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MAP_LAT = 11.8817;
const MAP_LON = -15.6181;

export default function BissauMap({ className = '' }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [MAP_LAT, MAP_LON],
      zoom: 15,
      scrollWheelZoom: false, // évite le zoom accidentel en scrollant la page
      attributionControl: true,
    });

    // Tuiles OpenStreetMap (chargées en images — pas d'iframe)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Marqueur personnalisé (divIcon — aucune image externe requise)
    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width: 40px; height: 40px; border-radius: 50% 50% 50% 4px;
        transform: rotate(-45deg);
        background: #0066CC; border: 3px solid #ffffff;
        box-shadow: 0 4px 12px rgba(0,0,0,.35);
        display: flex; align-items: center; justify-content: center;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(45deg)">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3" fill="#ffffff" stroke="none"/>
        </svg>
      </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 38],
      popupAnchor: [0, -36],
    });

    L.marker([MAP_LAT, MAP_LON], { icon })
      .addTo(map)
      .bindPopup('<b>Pebiss</b><br/>Pluba - Curva de Djon Cubala, Bissau')
      .openPopup();

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className={`h-full w-full z-0 ${className}`} aria-label="Carte de localisation Pebiss — Bissau" />;
}
