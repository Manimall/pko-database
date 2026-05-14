import { Building2, BarChart3, TrendingUp } from 'lucide-react';
import { SiteHeader } from './SiteHeader';
import s from './HeroScreen.module.css';

interface HeroScreenProps {
  activeTab?: 'pko300' | 'thematic';
  onNavigateToThematic?: () => void;
  onNavigateToRating?: () => void;
}

const STATS = [
  { icon: Building2,  label: 'Компаний', value: '530+' },
  { icon: BarChart3,  label: 'Данные',   value: 'ФНС 2025' },
  { icon: TrendingUp, label: 'Динамика', value: 'за 5 лет' },
] as const;

export function HeroScreen({
  activeTab = 'pko300',
  onNavigateToThematic,
  onNavigateToRating,
}: HeroScreenProps) {
  return (
    <div className={s.hero}>
      <div className={s.glowTopRight} />
      <div className={s.glowBottomLeft} />

      <SiteHeader
        activeTab={activeTab}
        onNavigateToThematic={onNavigateToThematic}
        onNavigateToRating={onNavigateToRating}
      />

      <div className={s.bgImageBox}>
        <img
          className={s.bgImage}
          src="/images/hero-architecture.webp"
          alt=""
          decoding="async"
          fetchPriority="high"
        />
      </div>

      <section className={s.main} aria-label="ПКО-300 — главный рейтинг">
        <div className={s.content}>
          <h1 className={s.title}>ПКО-300</h1>
          <p className={s.subtitle}>Главный рейтинг коллекторских агентств России</p>

          <div className={s.statsRow}>
            {STATS.map(({ icon: Icon, label, value }) => (
              <div key={label}>
                <div className={s.statLabel}>
                  <Icon size={14} />
                  <span className={s.statLabelText}>{label}</span>
                </div>
                <div className={s.statValue}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
