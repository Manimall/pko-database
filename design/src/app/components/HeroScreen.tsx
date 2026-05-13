import { Building2, BarChart3, TrendingUp } from 'lucide-react';
import { useIsMobile } from '../shared/hooks/useIsMobile';
import { SiteHeader } from './SiteHeader';

interface HeroScreenProps {
  activeTab?: 'pko300' | 'thematic';
  onNavigateToThematic?: () => void;
  onNavigateToRating?: () => void;
}

export function HeroScreen({ activeTab = 'pko300', onNavigateToThematic, onNavigateToRating }: HeroScreenProps) {
  const isMobile = useIsMobile();
  const spaceGrotesk = "'Space Grotesk', sans-serif";

  return (
    <div style={{
      background: '#0a0f15',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Glow effects */}
      <div style={{
        position: 'absolute', top: '-20%', right: '-10%', width: '60%', height: '120%',
        background: 'radial-gradient(circle, rgba(0,185,177,0.12) 0%, transparent 60%)',
        pointerEvents: 'none', zIndex: 1,
      }} />
      <div style={{
        position: 'absolute', bottom: '-30%', left: '-10%', width: '50%', height: '80%',
        background: 'radial-gradient(circle, rgba(0,96,185,0.08) 0%, transparent 60%)',
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/* Header */}
      <SiteHeader activeTab={activeTab} onNavigateToThematic={onNavigateToThematic} onNavigateToRating={onNavigateToRating} />

      {/* Pyramid Background — на всю высоту */}
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: isMobile ? '100%' : '55%', zIndex: 1, opacity: isMobile ? 0.4 : 1 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #0a0f15 0%, transparent 40%, transparent 80%, #0a0f15 100%)', zIndex: 2 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #0a0f15 0%, transparent 10%, transparent 80%, #0a0f15 100%)', zIndex: 2 }} />
        <img
          src="/images/hero-architecture.jpg"
          alt="Architecture Background"
          decoding="async"
          fetchPriority="high"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', opacity: 0.3, filter: 'grayscale(100%) contrast(1.2) brightness(0.7)' }}
        />
      </div>

      {/* Main Content */}
      <main style={{ display: 'flex', position: 'relative' }}>
        <div style={{ flex: 1, padding: isMobile ? '32px 16px 40px' : '64px 48px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 10, maxWidth: '750px' }}>
          <h1 style={{
            fontSize: 'clamp(3.5rem, 8vw, 5.5rem)',
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: '-0.03em',
            marginBottom: '16px',
            fontFamily: spaceGrotesk,
            color: '#0DF0E6',
          }}>
            ПКО-300
          </h1>
          <p style={{
            fontSize: 'clamp(1.4rem, 3vw, 2.2rem)',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '32px',
            lineHeight: 1.25,
          }}>
            Главный рейтинг коллекторских агентств России
          </p>

          <div style={{ display: 'flex', gap: isMobile ? '24px' : '40px', flexWrap: 'wrap' }}>
            {[
              { icon: Building2, label: 'Компаний', value: '530+' },
              { icon: BarChart3, label: 'Данные', value: 'ФНС 2025' },
              { icon: TrendingUp, label: 'Динамика', value: 'за 5 лет' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: 'rgba(255,255,255,0.3)' }}>
                  <Icon size={14} />
                  <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', fontFamily: spaceGrotesk }}>
                    {label}
                  </span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', fontFamily: spaceGrotesk }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
