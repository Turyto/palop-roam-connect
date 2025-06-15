import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface PALOPConnectivityMapProps {
  mapboxToken?: string;
}

const PALOPConnectivityMap: React.FC<PALOPConnectivityMapProps> = ({ 
  mapboxToken = "pk.eyJ1IjoidHVyeXRvIiwiYSI6ImNtYnh6bzNkMDFhNTQyd3MyNmIwbWRkZW4ifQ.TBkW_lOth0qLr8W8aXQd7A"
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // PALOP countries with enhanced styling
  const palopCountries = [
    { name: 'Cape Verde', lng: -24.0132, lat: 16.5388, color: '#3B82F6', size: 'large' },
    { name: 'Angola', lng: 17.8739, lat: -11.2027, color: '#10B981', size: 'large' },
    { name: 'Mozambique', lng: 35.5296, lat: -18.6657, color: '#F59E0B', size: 'large' },
    { name: 'Guinea-Bissau', lng: -15.1804, lat: 11.8037, color: '#EF4444', size: 'large' },
    { name: 'São Tomé and Príncipe', lng: 6.6131, lat: 0.1864, color: '#8B5CF6', size: 'large' }
  ];

  // Enhanced global hubs
  const globalHubs = [
    { name: 'Portugal', lng: -9.1393, lat: 39.3999, color: '#6B7280', type: 'Primary Hub' },
    { name: 'South Africa', lng: 28.0473, lat: -26.2041, color: '#6B7280', type: 'Regional Hub' },
    { name: 'Brazil', lng: -47.8825, lat: -15.7942, color: '#6B7280', type: 'CPLP Hub' },
    { name: 'France', lng: 2.2137, lat: 46.2276, color: '#6B7280', type: 'EU Hub' },
    { name: 'Netherlands', lng: 5.2913, lat: 52.1326, color: '#6B7280', type: 'EU Hub' },
    { name: 'Senegal', lng: -14.4524, lat: 14.4974, color: '#6B7280', type: 'West Africa Hub' }
  ];

  // Enhanced connection routes with plan types
  const connections = [
    // Cape Verde connections
    { from: palopCountries[0], to: globalHubs[0], plan: 'Core/Plus', strength: 'strong' },
    { from: palopCountries[0], to: globalHubs[2], plan: 'Local CPLP', strength: 'medium' },
    { from: palopCountries[0], to: globalHubs[5], plan: 'Plus', strength: 'medium' },
    
    // Angola connections
    { from: palopCountries[1], to: globalHubs[0], plan: 'Core/Plus', strength: 'strong' },
    { from: palopCountries[1], to: globalHubs[1], plan: 'Plus/NGO', strength: 'strong' },
    { from: palopCountries[1], to: globalHubs[2], plan: 'Local CPLP', strength: 'medium' },
    
    // Mozambique connections
    { from: palopCountries[2], to: globalHubs[0], plan: 'Plus', strength: 'medium' },
    { from: palopCountries[2], to: globalHubs[1], plan: 'Plus/NGO', strength: 'strong' },
    { from: palopCountries[2], to: globalHubs[2], plan: 'Local CPLP', strength: 'medium' },
    
    // Guinea-Bissau connections
    { from: palopCountries[3], to: globalHubs[0], plan: 'Core/Plus', strength: 'strong' },
    { from: palopCountries[3], to: globalHubs[3], plan: 'Plus', strength: 'medium' },
    { from: palopCountries[3], to: globalHubs[5], plan: 'Plus', strength: 'strong' },
    
    // São Tomé and Príncipe connections
    { from: palopCountries[4], to: globalHubs[0], plan: 'Lite/Plus', strength: 'medium' },
    { from: palopCountries[4], to: globalHubs[2], plan: 'Local CPLP', strength: 'medium' }
  ];

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) {
      setMapError("Mapbox token not available");
      return;
    }

    console.log('Initializing enhanced map...');
    
    mapboxgl.accessToken = mapboxToken;
    
    // Clean up existing map
    if (map.current) {
      map.current.remove();
    }
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [0, 0],
        zoom: 1.8,
        projection: 'naturalEarth',
        attributionControl: false
      });

      map.current.on('load', () => {
        console.log('Enhanced map loaded successfully');
        setIsMapLoaded(true);
        setMapError(null);
        
        if (!map.current) return;

        // Add enhanced connection lines with different styles based on strength
        connections.forEach((connection, index) => {
          const lineId = `connection-${index}`;
          
          map.current!.addSource(lineId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: { 
                plan: connection.plan,
                strength: connection.strength
              },
              geometry: {
                type: 'LineString',
                coordinates: [
                  [connection.from.lng, connection.from.lat],
                  [connection.to.lng, connection.to.lat]
                ]
              }
            }
          });

          const lineWidth = connection.strength === 'strong' ? 3 : connection.strength === 'medium' ? 2 : 1;
          const lineOpacity = connection.strength === 'strong' ? 0.8 : connection.strength === 'medium' ? 0.6 : 0.4;

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
              'line-width': lineWidth,
              'line-opacity': lineOpacity
            }
          });
        });

        // Add enhanced PALOP country markers
        palopCountries.forEach((country, index) => {
          // Create custom marker element
          const el = document.createElement('div');
          el.className = 'palop-marker';
          el.style.width = '24px';
          el.style.height = '24px';
          el.style.borderRadius = '50%';
          el.style.backgroundColor = country.color;
          el.style.border = '4px solid white';
          el.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
          el.style.cursor = 'pointer';
          el.style.transition = 'transform 0.2s ease';
          
          // Add hover effect
          el.addEventListener('mouseenter', () => {
            el.style.transform = 'scale(1.2)';
          });
          el.addEventListener('mouseleave', () => {
            el.style.transform = 'scale(1)';
          });

          // Enhanced popup with more information
          const popup = new mapboxgl.Popup({ 
            offset: 30,
            closeButton: false,
            className: 'custom-popup'
          }).setHTML(`
            <div class="p-3 min-w-[200px]">
              <h3 class="font-bold text-lg mb-2" style="color: ${country.color}">${country.name}</h3>
              <p class="text-sm text-gray-600 mb-2">PALOP Member Country</p>
              <div class="text-xs text-gray-500">
                <div>• Plans available: Lite, Core, Plus</div>
                <div>• Regional roaming enabled</div>
                <div>• Diaspora support included</div>
              </div>
            </div>
          `);

          new mapboxgl.Marker(el)
            .setLngLat([country.lng, country.lat])
            .setPopup(popup)
            .addTo(map.current!);
        });

        // Add enhanced global hub markers
        globalHubs.forEach((hub, index) => {
          const el = document.createElement('div');
          el.className = 'hub-marker';
          el.style.width = '16px';
          el.style.height = '16px';
          el.style.borderRadius = '50%';
          el.style.backgroundColor = hub.color;
          el.style.border = '3px solid white';
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
          el.style.cursor = 'pointer';
          el.style.transition = 'transform 0.2s ease';
          
          el.addEventListener('mouseenter', () => {
            el.style.transform = 'scale(1.3)';
          });
          el.addEventListener('mouseleave', () => {
            el.style.transform = 'scale(1)';
          });

          const popup = new mapboxgl.Popup({ 
            offset: 20,
            closeButton: false,
            className: 'custom-popup'
          }).setHTML(`
            <div class="p-3">
              <h3 class="font-bold text-sm mb-1">${hub.name}</h3>
              <p class="text-xs text-gray-600 mb-1">${hub.type}</p>
              <div class="text-xs text-gray-500">
                Roaming hub for PALOP connectivity
              </div>
            </div>
          `);

          new mapboxgl.Marker(el)
            .setLngLat([hub.lng, hub.lat])
            .setPopup(popup)
            .addTo(map.current!);
        });

        // Enhanced bounds fitting
        const bounds = new mapboxgl.LngLatBounds();
        [...palopCountries, ...globalHubs].forEach(location => {
          bounds.extend([location.lng, location.lat]);
        });
        map.current.fitBounds(bounds, { 
          padding: { top: 60, bottom: 60, left: 60, right: 60 }
        });
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Failed to load map. Please check your internet connection.');
        setIsMapLoaded(false);
      });

      // Add enhanced navigation controls
      map.current.addControl(new mapboxgl.NavigationControl({
        visualizePitch: true
      }), 'top-right');

      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
      
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map. Please check the Mapbox token.');
      setIsMapLoaded(false);
    }
  };

  useEffect(() => {
    // Auto-initialize map with the hardcoded token
    setTimeout(() => {
      initializeMap();
    }, 100);

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [mapboxToken]);

  if (mapError) {
    return (
      <div className="bg-white rounded-lg p-8 shadow-md text-center">
        <h3 className="text-lg font-semibold mb-4 text-red-600">Map Unavailable</h3>
        <p className="text-gray-600 mb-4">{mapError}</p>
        <p className="text-sm text-gray-500">
          The interactive map requires a valid Mapbox configuration. 
          Please contact our support team for assistance.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative">
        <div 
          ref={mapContainer} 
          className="w-full h-96 md:h-[500px]"
          style={{ minHeight: '400px' }}
        />
        {!isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-palop-green mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading interactive map...</p>
              <p className="text-sm text-gray-500">Connecting to PALOP network</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Enhanced legend */}
      <div className="p-6 bg-gradient-to-r from-gray-50 to-white">
        <h4 className="font-semibold mb-4 text-gray-800">Network Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-palop-blue border-2 border-white shadow-sm"></div>
            <span className="text-gray-700">Cape Verde</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-palop-green border-2 border-white shadow-sm"></div>
            <span className="text-gray-700">Angola</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-palop-yellow border-2 border-white shadow-sm"></div>
            <span className="text-gray-700">Mozambique</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-palop-red border-2 border-white shadow-sm"></div>
            <span className="text-gray-700">Guinea-Bissau</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-purple-500 border-2 border-white shadow-sm"></div>
            <span className="text-gray-700">São Tomé & Príncipe</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-500 border border-white shadow-sm"></div>
            <span className="text-gray-700">Global Hubs</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-palop-green opacity-80"></div>
              <span>Strong Connection</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-palop-blue opacity-60"></div>
              <span>Medium Connection</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-gray-400 opacity-40"></div>
              <span>Light Connection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PALOPConnectivityMap;
