import React from 'react';
import { Volume2, ArrowRight, CloudSun, BookOpen, Search, MessageCircle, CalendarDays, Star } from 'lucide-react';
import { speechNarrator } from '../../utils/speech';
export interface LocationCardProps {
  id: string; title: string; shortCopy: string; icon?: string;
  accentBg: string; accentColor: string; borderColor: string;
  hoverBorderColor: string; onOpen: () => void; badge?: string;
}
const ICONS = { weather: CloudSun, story: BookOpen, detective: Search,
  courage: MessageCircle, bridge: CalendarDays, starlight: Star };
export const LocationCard: React.FC<LocationCardProps> = p => {
  const Icon = ICONS[p.id as keyof typeof ICONS] || BookOpen;
  return <article className="qy-place-card" data-place={p.id}>
    <div className="qy-place-card-top">
      <span className={`qy-place-icon ${p.accentBg} ${p.accentColor}`}><Icon aria-hidden="true" /></span>
      <button className="qy-icon-button" type="button" aria-label={`听一听${p.title}的介绍`}
        onClick={() => speechNarrator.speak(`${p.title}。${p.shortCopy}`)}>
        <Volume2 aria-hidden="true" />
      </button>
    </div>
    <button type="button" className="qy-place-main" onClick={p.onOpen} aria-label={`进入${p.title}`}>
      <strong>{p.title}</strong><span>{p.shortCopy}</span><ArrowRight aria-hidden="true" />
    </button>
  </article>;
};
