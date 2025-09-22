import React from 'react';

const STYLE_MAP = {
  success: {
    border: 'border-l-emerald-500',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600',
    titleColor: 'text-emerald-700',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  info: {
    border: 'border-l-sky-500',
    iconBg: 'bg-sky-500/10',
    iconColor: 'text-sky-600',
    titleColor: 'text-sky-700',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 21c4.971 0 9-4.029 9-9s-4.029-9-9-9-9 4.029-9 9 4.029 9 9 9z" />
      </svg>
    ),
  },
  warning: {
    border: 'border-l-amber-500',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-600',
    titleColor: 'text-amber-700',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M4.93 19h14.14a1 1 0 00.87-1.5L12.87 4.5a1 1 0 00-1.74 0L4.06 17.5a1 1 0 00.87 1.5z" />
      </svg>
    ),
  },
  error: {
    border: 'border-l-rose-500',
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-600',
    titleColor: 'text-rose-700',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
};

export default function AlertBanner({ type = 'info', title, message, onClose }) {
  const style = STYLE_MAP[type] || STYLE_MAP.info;

  return (
    <div className={`flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm ${style.border}`}>
      <span className={`flex h-9 w-9 items-center justify-center rounded-full ${style.iconBg} ${style.iconColor}`}>
        {style.icon}
      </span>
      <div className="flex-1">
        <p className={`font-semibold ${style.titleColor}`}>{title}</p>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 transition-colors"
        aria-label="Dismiss alert"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
