import { X } from 'lucide-react';
import s from './FilterBar.module.css';

interface RadioOptionProps {
  checked: boolean;
  label: string;
  onChange: () => void;
}

export function RadioOption({ checked, label, onChange }: RadioOptionProps) {
  return (
    <label className={s.radioRow} onClick={onChange}>
      <div className={`${s.radioBox} ${checked ? s.radioBoxChecked : ''}`}>
        {checked && <div className={s.radioDot} />}
      </div>
      <span className={`${s.radioLabel} ${checked ? s.radioLabelChecked : ''}`}>{label}</span>
    </label>
  );
}

interface RangeInputsProps {
  fromVal: string;
  toVal: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}

export function RangeInputs({ fromVal, toVal, onFromChange, onToChange }: RangeInputsProps) {
  return (
    <div className={s.rangeRow}>
      <input
        className={s.rangeInput}
        type="number"
        value={fromVal}
        onChange={e => onFromChange(e.target.value)}
        placeholder="от"
      />
      <span className={s.rangeDash}>—</span>
      <input
        className={s.rangeInput}
        type="number"
        value={toVal}
        onChange={e => onToChange(e.target.value)}
        placeholder="до"
      />
      {(fromVal || toVal) && (
        <button
          type="button"
          className={s.rangeClearBtn}
          onClick={() => { onFromChange(''); onToChange(''); }}
          aria-label="Сбросить"
        >
          <X style={{ width: '14px', height: '14px' }} />
        </button>
      )}
    </div>
  );
}
