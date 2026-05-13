import { ArrowLeft, ArrowRight, Calendar } from 'lucide-react';
import { articles, Article, ArticleSection } from '../data/articlesData';
import { useIsMobile } from './ui/use-mobile';

function SectionRenderer({ section }: { section: ArticleSection }) {
  switch (section.type) {
    case 'heading':
      return (
        <h2 style={{
          fontSize: '18px',
          fontWeight: 700,
          color: '#fff',
          margin: '32px 0 16px',
          paddingLeft: '14px',
          borderLeft: '3px solid #0DF0E6',
          lineHeight: 1.3,
        }}>
          {section.content}
        </h2>
      );

    case 'subheading':
      return (
        <h3 style={{
          fontSize: '15px',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.85)',
          margin: '24px 0 12px',
          lineHeight: 1.3,
        }}>
          {section.content}
        </h3>
      );

    case 'paragraph':
      return (
        <p style={{
          fontSize: '14px',
          lineHeight: 1.75,
          color: 'rgba(255,255,255,0.65)',
          margin: '0 0 16px',
        }}>
          {section.content}
        </p>
      );

    case 'bullets':
      return (
        <ul style={{
          margin: '0 0 16px',
          paddingLeft: '0',
          listStyle: 'none',
        }}>
          {section.items?.map((item, i) => (
            <li key={i} style={{
              fontSize: '14px',
              lineHeight: 1.75,
              color: 'rgba(255,255,255,0.65)',
              padding: '4px 0 4px 20px',
              position: 'relative',
            }}>
              <span style={{
                position: 'absolute',
                left: 0,
                top: '10px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#0DF0E6',
              }} />
              {item}
            </li>
          ))}
        </ul>
      );

    case 'table':
      if (!section.table) return null;
      return (
        <div style={{
          margin: '20px 0 24px',
          overflowX: 'auto',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '13px',
            minWidth: '500px',
          }}>
            <thead>
              <tr>
                {section.table.headers.map((h, i) => (
                  <th key={i} style={{
                    padding: '10px 14px',
                    textAlign: 'left',
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase' as const,
                    color: '#0DF0E6',
                    background: 'rgba(13,240,230,0.05)',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.table.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{
                      padding: '10px 14px',
                      color: 'rgba(255,255,255,0.7)',
                      borderBottom: ri < section.table!.rows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      background: ri % 2 === 1 ? 'rgba(255,255,255,0.02)' : 'transparent',
                      whiteSpace: 'nowrap',
                    }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    default:
      return null;
  }
}

interface ArticleContentProps {
  articleId: string;
  onBack: () => void;
  onArticleClick: (id: string) => void;
}

export function ArticleContent({ articleId, onBack, onArticleClick }: ArticleContentProps) {
  const isMobile = useIsMobile();
  const article = articles.find(a => a.id === articleId);

  if (!article) {
    return (
      <div style={{ padding: '64px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
        Статья не найдена
      </div>
    );
  }

  const otherArticles = articles.filter(a => a.id !== articleId);

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto' }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.5)',
          fontSize: '13px',
          cursor: 'pointer',
          padding: '20px 0 16px',
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#0DF0E6'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
      >
        <ArrowLeft style={{ width: '14px', height: '14px' }} />
        Тематические рейтинги
      </button>

      {/* Hero image */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: isMobile ? '200px' : '320px',
        borderRadius: '12px',
        overflow: 'hidden',
        marginBottom: '24px',
      }}>
        <img
          src={article.image}
          alt={article.title}
          decoding="async"
          fetchPriority="high"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(10,15,21,0.85) 0%, transparent 60%)',
        }} />
      </div>

      {/* Date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
        <Calendar style={{ width: '12px', height: '12px' }} />
        {article.date}
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: isMobile ? '22px' : '28px',
        fontWeight: 800,
        lineHeight: 1.2,
        color: '#fff',
        margin: '0 0 28px',
        letterSpacing: '-0.01em',
      }}>
        {article.title}
      </h1>

      {/* Content sections */}
      <div style={{ marginBottom: '48px' }}>
        {article.sections.map((section, i) => (
          <SectionRenderer key={i} section={section} />
        ))}
      </div>

      {/* Other articles */}
      {otherArticles.length > 0 && (
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '32px',
          marginBottom: '48px',
        }}>
          <h3 style={{
            fontSize: '12px',
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase' as const,
            color: 'rgba(255,255,255,0.4)',
            margin: '0 0 16px',
          }}>
            Другие материалы
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {otherArticles.map(a => (
              <div
                key={a.id}
                onClick={() => onArticleClick(a.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px',
                  background: '#111920',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(13,240,230,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
              >
                <div style={{
                  width: '64px',
                  height: '44px',
                  flexShrink: 0,
                  overflow: 'hidden',
                  borderRadius: '4px',
                }}>
                  <img src={a.image} alt={a.title} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#fff',
                    lineHeight: 1.35,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {a.title}
                  </div>
                </div>
                <ArrowRight style={{ width: '14px', height: '14px', color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
