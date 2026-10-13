"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

const DIVISIONS = [
  { name: "Dhaka", lat: 23.8103, lng: 90.4125 },
  { name: "Chattogram", lat: 22.3569, lng: 91.7832 },
  { name: "Rajshahi", lat: 24.3745, lng: 88.6042 },
  { name: "Khulna", lat: 22.8456, lng: 89.5403 },
  { name: "Barishal", lat: 22.701, lng: 90.3535 },
  { name: "Sylhet", lat: 24.8949, lng: 91.8687 },
  { name: "Rangpur", lat: 25.7439, lng: 89.2752 },
  { name: "Mymensingh", lat: 24.7471, lng: 90.4203 },
];

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID";

type Position = { lat: number; lng: number };
type Bounds = { extend(position: Position): void };
type CoverageMap = { fitBounds(bounds: Bounds, padding: number): void };
type Marker = { map: CoverageMap | null };

// Only the Google Maps API surface used by this component.
type MapsApi = {
  Map: new (element: HTMLElement, options: {
    center: Position;
    zoom: number;
    mapId: string;
    mapTypeControl: boolean;
    streetViewControl: boolean;
    gestureHandling: string;
  }) => CoverageMap;
  LatLngBounds: new () => Bounds;
  marker: {
    AdvancedMarkerElement: new (options: {
      map: CoverageMap;
      position: Position;
      title: string;
      content: HTMLElement;
    }) => Marker;
  };
};

export function DivisionMap() {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!ready || !container.current) return;

    const maps = (window as Window & { google?: { maps: MapsApi } }).google?.maps;
    if (!maps?.marker) return;

    const map = new maps.Map(container.current, {
      center: { lat: 24.1, lng: 90.3 },
      zoom: 7,
      mapId: MAP_ID,
      mapTypeControl: false,
      streetViewControl: false,
      gestureHandling: "cooperative",
    });
    const bounds = new maps.LatLngBounds();
    const markers = DIVISIONS.map(({ name, lat, lng }) => {
      const position = { lat, lng };
      bounds.extend(position);

      const label = document.createElement("div");
      label.className = "flex flex-col items-center";
      const caption = document.createElement("span");
      caption.className = "rounded-full border border-border bg-card px-2 py-1 text-xs font-semibold text-foreground shadow-md";
      caption.textContent = name;
      const pin = document.createElement("span");
      pin.className = "-mt-0.5 size-3 rotate-45 rounded-br-sm border-b-2 border-r-2 border-white bg-primary shadow-md";
      label.append(caption, pin);

      return new maps.marker.AdvancedMarkerElement({
        map,
        position,
        title: `${name} Division — ${name} city`,
        content: label,
      });
    });

    const resize = new ResizeObserver(() => map.fitBounds(bounds, 60));
    resize.observe(container.current);
    map.fitBounds(bounds, 60);

    return () => {
      resize.disconnect();
      markers.forEach((marker) => { marker.map = null; });
    };
  }, [ready]);

  return (
    <>
      {API_KEY && !failed ? (
        <>
          <Script
            id="google-maps-coverage"
            src={`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(API_KEY)}&libraries=marker&v=weekly`}
            strategy="lazyOnload"
            onReady={() => setReady(true)}
            onError={() => setFailed(true)}
          />
          <div ref={container} className="h-full w-full" aria-label="Bangladesh map with pins at all eight divisional capitals" />
        </>
      ) : (
        <iframe
          src="https://www.google.com/maps?q=Bangladesh&output=embed&z=7"
          width="100%"
          height="100%"
          className="block border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="LogiFlow delivery coverage map — Bangladesh"
        />
      )}
      <ul className="sr-only" aria-label="Delivery coverage divisions">
        {DIVISIONS.map(({ name }) => <li key={name}>{name}</li>)}
      </ul>
    </>
  );
}
