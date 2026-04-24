import React from 'react';
import { cn } from '@/src/lib/utils';

interface GoogleMapEmbedProps {
  lat: number;
  lng: number;
  title: string;
  className?: string;
  language?: 'ar' | 'en';
}

export function GoogleMapEmbed({ lat, lng, title, className, language = 'ar' }: GoogleMapEmbedProps) {
  // Using a format that better supports markers with labels
  const encodedTitle = encodeURIComponent(title);
  const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}+(${encodedTitle})&hl=${language}&t=&z=15&ie=UTF8&iwloc=B&output=embed`;

  return (
    <div className={cn("w-full h-full rounded-2xl overflow-hidden shadow-lg border border-aurum-gold/10", className)}>
      <iframe
        title={title}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        src={embedUrl}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
