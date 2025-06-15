
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const PALOPConnectivityMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isTokenSet, setIsTokenSet] = useState(false);

  // PALOP countries and their coordinates
  const palopCountries = [
    { name: 'Cape Verde', lng: -24.0132, lat: 16.5388, color: '#3B82F6' },
    { name: 'Angola', lng: 17.8739, lat: -11.2027, color: '#10B981' },
    { name: 'Mozambique', lng: 35.5296, lat: -18.6657, color: '#F59E0B' },
    { name: 'Guinea-Bissau', lng: -15.1804, lat: 11.8037, color: '#EF4444' },
    { name: 'São Tomé and Príncipe', lng: 6.6131, lat: 0.1864, color: '#8B5CF6' }
  ];

  // Global hubs and connections
  const globalHubs = [
    { name: 'Portugal', lng: -9.1393, lat: 39.3999, color: '#6B7280' },
    { name: 'South Africa', lng: 28.0473, lat: -26.2041, color: '#6B7280' },
    { name: 'Brazil', lng: -47.8825, lat: -15.7942, color: '#6B7280' },
    { name: 'France', lng: 2.2137, lat: 46.2276, color: '#6B7280' },
    { name: 'Netherlands', lng: 5.2913, lat: 52.1326, color: '#6B7280' },
    { name: 'Senegal', lng: -14.4524, lat: 14.4974, color: '#6B7280' }
  ];

  // Connection routes (PALOP to hubs)
  const connections = [
    // Cape Verde connections
    { from: palopCountries[0], to: globalHubs[0], plan: 'Core/Plus' },
    { from: palopCountries[0], to: globalHubs[2], plan: 'Local CPLP' },
    { from: palopCountries[0], to: globalHubs[5], plan: 'Plus' },
    
    // Angola connections
    { from: palopCountries[1], to: globalHubs[0], plan: 'Core/Plus' },
    { from: palopCountries[1], to: globalHubs[1], plan: 'Plus/NGO' },
    { from: palopCountries[1], to: globalHubs[2], plan: 'Local CPLP' },
    
    // Mozambique connections
    { from: palopCountries[2], to: globalHubs[0], plan: 'Plus' },
    { from: palopCountries[2], to: globalHubs[1], plan: 'Plus/NGO' },
    { from: palopCountries[2], to: globalHubs[2], plan: 'Local CPLP' },
    
    // Guinea-Bissau connections
    { from: palopCountries[3], to: globalHubs[0], plan: 'Core/Plus' },
    { from: palopCountries[3], to: globalHubs[3], plan: 'Plus' },
    { from: palopCountries[3], to: globalHubs[5], plan: 'Plus' },
    
    // São Tomé and Príncipe connections
    { from: palopCountries[4], to: globalHubs[0], plan: 'Lite/Plus' },
    { from: palopCountries[4], to: globalHubs[2], plan: 'Local CPLP' }
  ];

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken.trim()) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [0, 0],
      zoom: 2,
      projection: 'naturalEarth'
    });

    map.current.on('load', () => {
      if (!map.current) return;

      // Add connection lines
      connections.forEach((connection, index) => {
        const lineId = `connection-${index}`;
        
        map.current!.addSource(lineId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: { plan: connection.plan },
            geometry: {
              type: 'LineString',
              coordinates: [
                [connection.from.lng, connection.from.lat],
                [connection.to.lng, connection.to.lat]
              ]
            }
          }
        });

        map.current!.addLayer({
          id: lineId,
          type: 'line',
          source: lineId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': connection.from.color,
            'line-width': 2,
            'line-opacity': 0.7
          }
        });
      });

      // Add PALOP country markers
      palopCountries.forEach((country, index) => {
        const el = document.createElement('div');
        el.className = 'palop-marker';
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = country.color;
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';

        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-2">
              <h3 class="font-bold text-sm">${country.name}</h3>
              <p class="text-xs text-gray-600">PALOP Member</p>
            </div>
          `);

        new mapboxgl.Marker(el)
          .setLngLat([country.lng, country.lat])
          .setPopup(popup)
          .addTo(map.current!);
      });

      // Add global hub markers
      globalHubs.forEach((hub, index) => {
        const el = document.createElement('div');
        el.className = 'hub-marker';
        el.style.width = '12px';
        el.style.height = '12px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = hub.color;
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 1px 2px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';

        const popup = new mapboxgl.Popup({ offset: 15 })
          .setHTML(`
            <div class="p-2">
              <h3 class="font-bold text-sm">${hub.name}</h3>
              <p class="text-xs text-gray-600">Roaming Hub</p>
            </div>
          `);

        new mapboxgl.Marker(el)
          .setLngLat([hub.lng, hub.lat])
          .setPopup(popup)
          .addTo(map.current!);
      });

      // Fit map to show all markers
      const bounds = new mapboxgl.LngLatBounds();
      [...palopCountries, ...globalHubs].forEach(location => {
        bounds.extend([location.lng, location.lat]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
  };

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      setIsTokenSet(true);
      initializeMap();
    }
  };

  useEffect(() => {
    return () => {
      map.current?.remove();
    };
  }, []);

  if (!isTokenSet) {
    return (
      <div className="bg-white rounded-lg p-8 shadow-md text-center">
        <h3 className="text-lg font-semibold mb-4">Interactive PALOP Connectivity Map</h3>
        <p className="text-gray-600 mb-4">
          To display the interactive map, please enter your Mapbox public token.
          Get yours at <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-palop-green underline">mapbox.com</a>
        </p>
        <div className="flex gap-2 max-w-md mx-auto">
          <Input
            type="text"
            placeholder="Enter Mapbox public token"
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleTokenSubmit} className="bg-palop-green hover:bg-palop-green/90">
            Load Map
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div ref={mapContainer} className="w-full h-96" />
      <div className="p-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-palop-blue border-2 border-white"></div>
            <span>Cape Verde</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-palop-green border-2 border-white"></div>
            <span>Angola</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-palop-yellow border-2 border-white"></div>
            <span>Mozambique</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-palop-red border-2 border-white"></div>
            <span>Guinea-Bissau</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-500 border-2 border-white"></div>
            <span>São Tomé & Príncipe</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500 border border-white"></div>
            <span>Roaming Hubs</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PALOPConnectivityMap;
