export default function Input({ label, error, helperText, className = '', ...props }) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="block text-sm font-semibold text-slate-700">{label}</span>}
      <input
        className={`h-11 w-full rounded-xl border px-4 text-sm text-slate-800 outline-none transition focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-100 ${
          error ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-brand-500'
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-xs font-medium text-red-600">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </label>
  )
}
