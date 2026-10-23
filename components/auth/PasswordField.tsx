'use client';

import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
  label: string;
  hint?: string;
}

export default function PasswordField({ label, hint, id, ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className="ta-field">
      <label htmlFor={id}>{label}</label>
      <div className="ta-password">
        <input {...props} id={id} type={visible ? 'text' : 'password'} aria-describedby={[props['aria-describedby'], hintId].filter(Boolean).join(' ') || undefined} />
        <button type="button" onClick={() => setVisible(!visible)} aria-label={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`} aria-pressed={visible} aria-controls={id}>
          {visible ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
        </button>
      </div>
      {hint && <p id={hintId} className="ta-field-hint">{hint}</p>}
    </div>
  );
}
