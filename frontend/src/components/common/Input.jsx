export default function Input({ label, error, helperText, className = '', ...props }) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="block text-sm font-semibold text-ubuntu-muted">{label}</span>}
      <input
        className={`h-11 w-full rounded-xl2 border bg-ubuntu-surface px-4 text-sm text-ubuntu-text placeholder:text-ubuntu-muted/80 outline-none transition-all duration-250 ease-in-out focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-ubuntu-surfaceAlt disabled:text-ubuntu-muted ${
          error ? 'border-red-400 focus:border-red-500' : 'border-ubuntu-border focus:border-brand-500'
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="text-xs font-medium text-red-400">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-ubuntu-muted">{helperText}</p>
      ) : null}
    </label>
  )
}
