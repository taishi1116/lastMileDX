'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DeliveryPoint } from '@/types/delivery';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  deliveryPoints: DeliveryPoint[];
  onUpdateCourse: (id: number, courseNumber: string) => Promise<void>;
  onSelectPoints: (points: DeliveryPoint[]) => void;
}

function SelectionRectangle({ onSelect }: { onSelect: (bounds: L.LatLngBounds) => void }) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState<L.LatLng | null>(null);
  const [endPoint, setEndPoint] = useState<L.LatLng | null>(null);
  const rectangleRef = useRef<L.Rectangle | null>(null);

  const map = useMapEvents({
    mousedown: (e) => {
      if (e.originalEvent.shiftKey) {
        setIsSelecting(true);
        setStartPoint(e.latlng);
        setEndPoint(e.latlng);
      }
    },
    mousemove: (e) => {
      if (isSelecting && startPoint) {
        setEndPoint(e.latlng);
        
        if (rectangleRef.current) {
          map.removeLayer(rectangleRef.current);
        }
        
        const bounds = L.latLngBounds(startPoint, e.latlng);
        rectangleRef.current = L.rectangle(bounds, {
          color: '#3b82f6',
          weight: 2,
          fillOpacity: 0.2,
        }).addTo(map);
      }
    },
    mouseup: () => {
      if (isSelecting && startPoint && endPoint) {
        const bounds = L.latLngBounds(startPoint, endPoint);
        onSelect(bounds);
        
        if (rectangleRef.current) {
          map.removeLayer(rectangleRef.current);
          rectangleRef.current = null;
        }
        
        setIsSelecting(false);
        setStartPoint(null);
        setEndPoint(null);
      }
    },
  });

  return null;
}

export default function Map({ deliveryPoints, onUpdateCourse, onSelectPoints }: MapProps) {
  const [selectedPoint, setSelectedPoint] = useState<DeliveryPoint | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingCourse, setEditingCourse] = useState('');
  const mapRef = useRef<L.Map | null>(null);
  
  const iconCache = useMemo(() => new Map<string, L.DivIcon>(), []);

  useEffect(() => {
    if (mapRef.current && deliveryPoints.length > 0) {
      const validPoints = deliveryPoints.filter(p => p.latitude && p.longitude);
      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(
          validPoints.map(p => [p.latitude!, p.longitude!] as [number, number])
        );
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [deliveryPoints]);

  const handleEditCourse = async (point: DeliveryPoint) => {
    if (point.id && editingCourse !== point.course_number) {
      await onUpdateCourse(point.id, editingCourse);
      setEditingId(null);
      setEditingCourse('');
    }
  };

  const handleSelectInBounds = (bounds: L.LatLngBounds) => {
    const selectedPoints = deliveryPoints.filter(point => {
      if (point.latitude && point.longitude) {
        return bounds.contains([point.latitude, point.longitude]);
      }
      return false;
    });
    onSelectPoints(selectedPoints);
  };

  const getMarkerColor = (courseNumber: string) => {
    const colors = [
      '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
      '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#06b6d4'
    ];
    const index = parseInt(courseNumber) % colors.length;
    return colors[index] || '#6b7280';
  };

  const getOrCreateIcon = useCallback((courseNumber: string) => {
    if (!iconCache.has(courseNumber)) {
      const color = getMarkerColor(courseNumber);
      const icon = L.divIcon({
        html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${courseNumber}</div>`,
        className: 'custom-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      iconCache.set(courseNumber, icon);
    }
    return iconCache.get(courseNumber)!;
  }, [iconCache]);

  return (
    <div className="relative h-full">
      <div className="absolute top-4 left-4 z-[1000] bg-white p-2 rounded shadow-md">
        <p className="text-sm text-gray-600">
          Shift + ドラッグで範囲選択
        </p>
      </div>
      
      <MapContainer
        center={[35.6762, 139.6503]}
        zoom={12}
        className="h-full w-full"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <SelectionRectangle onSelect={handleSelectInBounds} />
        
        {deliveryPoints.map((point) => {
          if (!point.latitude || !point.longitude || !point.id) return null;
          
          return (
            <Marker
              key={point.id}
              position={[point.latitude, point.longitude]}
              icon={getOrCreateIcon(point.course_number)}
              eventHandlers={{
                click: () => setSelectedPoint(point),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      コース番号:
                    </label>
                    {editingId === point.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingCourse}
                          onChange={(e) => setEditingCourse(e.target.value)}
                          className="border rounded px-2 py-1 text-sm"
                          autoFocus
                        />
                        <button
                          onClick={() => handleEditCourse(point)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditingCourse('');
                          }}
                          className="bg-gray-300 px-2 py-1 rounded text-sm"
                        >
                          キャンセル
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{point.course_number}</span>
                        <button
                          onClick={() => {
                            setEditingId(point.id!);
                            setEditingCourse(point.course_number);
                          }}
                          className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          編集
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="font-medium">お客様名:</span> {point.customer_name}
                    </div>
                    <div>
                      <span className="font-medium">お客様コード:</span> {point.customer_code}
                    </div>
                    <div>
                      <span className="font-medium">住所:</span> {point.address}
                    </div>
                    <div>
                      <span className="font-medium">売上:</span> ¥{point.sales.toLocaleString()}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}