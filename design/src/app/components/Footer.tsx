import { useIsMobile } from '../shared/hooks/useIsMobile';

const ACCENT = '#0DF0E6';
const MUTED = 'rgba(255,255,255,0.35)';

export function Footer() {
  const isMobile = useIsMobile();
  const linkStyle: React.CSSProperties = {
    color: 'rgba(255,255,255,0.5)',
    textDecoration: 'none',
    transition: 'color 0.2s',
  };

  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.08)',
      padding: isMobile ? '20px 12px 32px' : '32px 32px 48px',
      background: '#0a0f15',
      flexShrink: 0,
    }}>
      <div>
        {/* Контакты */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: MUTED, marginBottom: '10px' }}>
            Контакты
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px', fontSize: '13px' }}>
            <a
              href="mailto:redchief@rvzrus.ru"
              style={linkStyle}
              onMouseEnter={e => { e.currentTarget.style.color = ACCENT; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
            >
              redchief@rvzrus.ru
            </a>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <a
              href="https://t.me/rusrvz"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                width: 'fit-content',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', padding: '6px 14px',
                color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 500,
                textDecoration: 'none', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(13,240,230,0.1)'; e.currentTarget.style.borderColor = 'rgba(13,240,230,0.3)'; e.currentTarget.style.color = ACCENT; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.492-1.302.48-.428-.013-1.252-.242-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              Telegram-канал
            </a>
            <a
              href="https://max.ru/id9725047250_biz"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                width: 'fit-content',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', padding: '6px 14px',
                color: 'rgba(255,255,255,0.6)', fontSize: '13px', fontWeight: 500,
                textDecoration: 'none', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(13,240,230,0.1)'; e.currentTarget.style.borderColor = 'rgba(13,240,230,0.3)'; e.currentTarget.style.color = ACCENT; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-1-1 3.5-3.5L10 9l1-1 4.5 4.5L11 17z"/></svg>
              Канал в MAX
            </a>
            </div>
          </div>
        </div>

        {/* Юридический текст */}
        <p style={{
          fontSize: '11px',
          lineHeight: 1.6,
          color: 'rgba(255,255,255,0.2)',
          margin: '0 0 20px',
        }}>
          Сетевое издание зарегистрировано в Федеральной службе по надзору в сфере связи, информационных технологий
          и массовых коммуникаций (Роскомнадзор) 10 февраля 2022 года. Регистрационный номер СМИ ЭЛ № ФС77-82673
          от 10.02.2022. Учредитель сетевого издания «Рынок взыскания» — Автономная некоммерческая организация
          «Центр поддержки цивилизованного рынка взыскания». Юридический адрес: 115280, город Москва,
          ул. Ленинская Слобода, д. 19, этаж 5 ком. 21т3. Учредитель Автономной некоммерческой организации
          «Центр поддержки цивилизованного рынка взыскания» (АНО «Рынок взыскания»)
          (ИНН: 9725047250, ОГРН: 1217700144716) — Общество с ограниченной ответственностью «ЛИГАЛРЕСУРСЕС»
          (ИНН: 9725033401, ОГРН: 1207700233146, юридический адрес: 115280, город Москва,
          ул. Ленинская Слобода, д. 19, этаж 5 комната 21т3). Главный редактор Юдаев А.Ю. Все права защищены.
        </p>

        {/* Нижняя строка */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' as const : 'row' as const,
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '12px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '16px',
        }}>
          <a
            href="#"
            style={linkStyle}
            onMouseEnter={e => { e.currentTarget.style.color = ACCENT; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
          >
            Политика конфиденциальности
          </a>
          <span style={{ color: MUTED }}>
            Все права защищены © 2010–2026
          </span>
        </div>
      </div>
    </footer>
  );
}
