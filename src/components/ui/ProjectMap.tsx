import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Project } from '@/src/types';
import { Link } from 'react-router-dom';
import { Building2, MapPin, ExternalLink } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useLanguage } from '@/src/context/LanguageContext';

// Fix for Leaflet default icon issues in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface ProjectMapProps {
  projects?: Project[];
  coordinates?: { lat: number; lng: number };
  title?: string;
  className?: string;
}

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export function ProjectMap({ projects, coordinates, title, className }: ProjectMapProps) {
  // If coordinates are provided, show single marker
  if (coordinates) {
    const center: [number, number] = [coordinates.lat, coordinates.lng];
    return (
      <div className={cn("h-[400px] w-full rounded-2xl overflow-hidden shadow-lg border border-aurum-gold/10 relative z-0", className)}>
        <MapContainer 
          center={center} 
          zoom={13} 
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={center}>
            <Popup className="custom-popup">
              <div className="p-3 min-w-[200px] text-right" dir="rtl">
                <h3 className="font-bold text-aurum-navy mb-1 text-sm">{title}</h3>
                <div className="flex items-center gap-1 justify-end text-gray-500 text-[10px] mb-2">
                  <span>مقر مشروع أورم العقاري</span>
                  <MapPin size={10} className="text-aurum-gold" />
                </div>
                <div className="pt-2 border-t border-gray-100 flex justify-start">
                   <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-aurum-gold font-bold flex items-center gap-1 hover:underline"
                   >
                     الموقع على خرائط جوجل
                     <ExternalLink size={10} />
                   </a>
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    );
  }

  // Otherwise handle multiple projects
  const { language, t } = useLanguage();
  const projectsWithMap = projects?.filter(p => p.coordinates) || [];
  
  // Default center if no projects
  const defaultCenter: [number, number] = [30.0444, 31.2357]; // Cairo
  
  // Calculate average center if projects exist
  const center: [number, number] = projectsWithMap.length > 0 
    ? [
        projectsWithMap.reduce((sum, p) => sum + (p.coordinates?.lat || 0), 0) / projectsWithMap.length,
        projectsWithMap.reduce((sum, p) => sum + (p.coordinates?.lng || 0), 0) / projectsWithMap.length
      ]
    : defaultCenter;

  return (
    <div className={cn("h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl border border-aurum-gold/20 mb-12 relative z-0", className)}>
      <MapContainer 
        center={center} 
        zoom={10} 
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={center} zoom={projectsWithMap.length === 1 ? 13 : 10} />
        
        {projectsWithMap.map((project) => (
          <Marker 
            key={project.id} 
            position={[project.coordinates!.lat, project.coordinates!.lng]}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-[240px]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="relative h-32 mb-3 rounded-xl overflow-hidden bg-gradient-to-br from-aurum-navy to-aurum-gold/30">
                  <img src={project.image} alt={language === 'ar' ? project.titleAr : project.titleEn} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-aurum-gold text-aurum-navy text-[10px] px-2 py-0.5 rounded font-bold shadow-lg">
                    {t(
                      project.type === 'residential' ? 'سكني' : project.type === 'office' ? 'إداري' : 'تجاري',
                      project.type.charAt(0).toUpperCase() + project.type.slice(1)
                    )}
                  </div>
                </div>
                
                <h3 className="font-bold text-aurum-navy mb-1 text-sm">
                  {language === 'ar' ? project.titleAr : project.titleEn}
                </h3>
                <div className="flex items-center gap-1 text-gray-500 text-[11px] mb-3">
                  <MapPin size={12} className="text-aurum-gold" />
                  <span>{language === 'ar' ? project.locationAr : project.locationEn}</span>
                </div>
                
                <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-100">
                  <span className="text-sm font-bold text-aurum-navy">{project.price}</span>
                  <Link 
                    to={`/projects/${project.id}`}
                    className="flex items-center gap-1 text-[11px] text-aurum-gold font-bold hover:text-aurum-gold-light transition-all"
                  >
                    {t("التفاصيل", "Details")}
                    <ExternalLink size={12} className={language === 'ar' ? "" : "rotate-180"} />
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map Legend/Overlay */}
      <div className={cn(
        "absolute bottom-6 z-[400] bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-aurum-gold/10 hidden md:block",
        language === 'ar' ? "right-6" : "left-6"
      )}>
        <h4 className="text-xs font-bold text-aurum-navy mb-3 uppercase tracking-wider">
          {t("مواقع مشاريعنا", "Our Project Locations")}
        </h4>
        <div className="flex flex-col gap-2.5">
          {[
            { label: t("القاهرة الجديدة", "New Cairo"), color: "bg-aurum-gold" },
            { label: t("العاصمة الإدارية", "New Capital"), color: "bg-aurum-gold" },
            { label: t("الشيخ زايد", "Sheikh Zayed"), color: "bg-aurum-gold" }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className={cn("w-2.5 h-2.5 rounded-full", item.color)} />
              <span className="text-[11px] text-gray-600 font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
