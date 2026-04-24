import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Save, X, Edit3, Loader2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/src/services/firebase';
import { cn } from '@/src/lib/utils';
import { useAdmin } from '@/src/services/adminHook';
import { useLanguage } from '@/src/context/LanguageContext';

interface EditableCoordinatesProps {
  projectId: string;
  currentCoords?: { lat: number; lng: number };
  className?: string;
}

export function EditableCoordinates({ projectId, currentCoords, className }: EditableCoordinatesProps) {
  const { isAdmin } = useAdmin();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [coords, setCoords] = useState(currentCoords || { lat: 30.0444, lng: 31.2357 }); // Default Cairo
  const [tempLat, setTempLat] = useState(String(currentCoords?.lat || 30.0444));
  const [tempLng, setTempLng] = useState(String(currentCoords?.lng || 31.2357));
  const [mapUrl, setMapUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentCoords) {
      setCoords(currentCoords);
      setTempLat(String(currentCoords.lat));
      setTempLng(String(currentCoords.lng));
    }
  }, [currentCoords]);

  const parseGoogleMapsUrl = (url: string) => {
    // Regex for coordinates in URL like @30.0444,31.2357
    const coordRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = url.match(coordRegex);
    
    if (match) {
      setTempLat(match[1]);
      setTempLng(match[2]);
      return true;
    }

    // Regex for query params like q=30.0444,31.2357
    const queryRegex = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/;
    const queryMatch = url.match(queryRegex);
    if (queryMatch) {
      setTempLat(queryMatch[1]);
      setTempLng(queryMatch[2]);
      return true;
    }

    return false;
  };

  const handleUrlChange = (url: string) => {
    setMapUrl(url);
    if (url) {
      parseGoogleMapsUrl(url);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const lat = parseFloat(tempLat);
      const lng = parseFloat(tempLng);

      if (isNaN(lat) || isNaN(lng)) {
        throw new Error("Invalid coordinates");
      }

      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        coordinates: { lat, lng }
      });

      setCoords({ lat, lng });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update coordinates", err);
      alert(t("فشل تحديث الإحداثيات. يرجى التأكد من الأرقام.", "Failed to update coordinates. Please check the values."));
    } finally {
      setSaving(false);
    }
  };

  if (isAdmin && isEditing) {
    return (
      <div className={cn("bg-white p-4 rounded-xl shadow-lg border border-aurum-gold/20 flex flex-col gap-4", className)}>
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-gray-400">
            {t("ألصق رابط خرائط جوجل", "Paste Google Maps Link")}
          </label>
          <input 
            type="text"
            value={mapUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
            placeholder={t("إلصاق الرابط هنا للاستخراج التلقائي...", "Paste link here to auto-extract...")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-gray-400">Latitude</label>
            <input 
              type="text"
              value={tempLat}
              onChange={(e) => setTempLat(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono"
              placeholder="e.g. 30.0444"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-gray-400">Longitude</label>
            <input 
              type="text"
              value={tempLng}
              onChange={(e) => setTempLng(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono"
              placeholder="e.g. 31.2357"
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {t("إلغاء", "Cancel")}
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-aurum-navy text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-black transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {t("حفظ الموقع", "Save Location")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative group/coords", className)}>
      {isAdmin && (
        <button 
          onClick={() => setIsEditing(true)}
          className="absolute -top-10 left-0 bg-aurum-gold text-aurum-navy p-2 rounded-full shadow-lg opacity-0 group-hover/coords:opacity-100 transition-all hover:scale-110 z-10 flex items-center gap-2 px-3"
        >
          <Edit3 size={14} />
          <span className="text-[10px] font-bold uppercase">{t("تعديل الخريطة", "Edit Map")}</span>
        </button>
      )}
      {/* This component just manages the UI for editing, the actual map is in the parent */}
      <div className="text-[10px] text-gray-400 font-mono mt-2 flex items-center gap-2 opacity-0 group-hover/coords:opacity-100 transition-opacity">
        <MapPin size={10} />
        {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
      </div>
    </div>
  );
}
