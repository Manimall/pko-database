import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useIsMobile } from '../../shared/hooks/useIsMobile';
import s from './FilterBar.module.css';

const PANEL_WIDTH = 380;
const PANEL_MARGIN = 8;

interface FilterDropdownProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}

export function FilterDropdown({ open, onClose, anchorRef, children }: FilterDropdownProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!open || !anchorRef.current || isMobile) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + PANEL_MARGIN,
      left: Math.max(PANEL_MARGIN, rect.right - PANEL_WIDTH),
    });
  }, [open, anchorRef, isMobile]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  // На десктопе панель прикреплена под кнопкой "Фильтры" и не уходит за viewport.
  // 175px = высота шапки (~155px) + 20px зазор снизу — то же значение, что и
  // на production. .panelBody внутри имеет overflow-y: auto и flex: 1 →
  // длинный контент скроллится внутри панели.
  const panelStyle = isMobile
    ? undefined
    : { top: pos.top, left: pos.left, maxHeight: 'calc(100vh - 175px)' };

  return createPortal(
    <div
      ref={panelRef}
      className={`${s.panel} ${isMobile ? s.panelMobile : ''}`}
      style={panelStyle}
    >
      <div className={s.panelHeader}>
        <span className={s.panelTitle}>Фильтры</span>
        <button type="button" className={s.panelCloseBtn} onClick={onClose} aria-label="Закрыть">
          <X style={{ width: '14px', height: '14px' }} />
        </button>
      </div>
      <div className={s.panelBody}>{children}</div>
      <div className={s.panelFooter}>
        <button type="button" className={s.applyBtn} onClick={onClose}>Применить</button>
      </div>
    </div>,
    document.body,
  );
}
