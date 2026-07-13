import type { Band } from '@rased/shared';

const bandConfig: Record<Band, { label: string; color: string; bg: string }> = {
  platinum: { label: 'Platinum', color: 'text-band-platinum', bg: 'bg-band-platinum/10' },
  high_green: { label: 'High Green', color: 'text-band-high-green', bg: 'bg-band-high-green/10' },
  medium_green: { label: 'Medium Green', color: 'text-band-medium-green', bg: 'bg-band-medium-green/10' },
  low_green: { label: 'Low Green', color: 'text-band-low-green', bg: 'bg-band-low-green/10' },
  red: { label: 'Red', color: 'text-band-red', bg: 'bg-band-red/10' },
};

const bandColors: Record<Band, string> = {
  platinum: '#6366f1',
  high_green: '#22c55e',
  medium_green: '#84cc16',
  low_green: '#eab308',
  red: '#ef4444',
};

export default function BandBadge({ band, size = 'md' }: { band: Band; size?: 'sm' | 'md' | 'lg' }) {
  const cfg = bandConfig[band];
  const dotSize = size === 'sm' ? 'h-2 w-2' : size === 'lg' ? 'h-4 w-4' : 'h-3 w-3';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium ${cfg.bg} ${cfg.color} ${textSize}`}>
      <span className={`rounded-full ${dotSize}`} style={{ backgroundColor: bandColors[band] }} />
      {cfg.label}
    </span>
  );
}

export function BandPill({ band, size = 'md' }: { band: Band; size?: 'sm' | 'md' | 'lg' }) {
  const dotSize = size === 'sm' ? 'h-2 w-2' : size === 'lg' ? 'h-4 w-4' : 'h-3 w-3';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium ${textSize}`}>
      <span className={`rounded-full ${dotSize}`} style={{ backgroundColor: bandColors[band] }} />
      {band}
    </span>
  );
}
