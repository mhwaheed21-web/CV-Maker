import LoadingSpinner from './LoadingSpinner'

export default function Button({
  children,
  variant = 'primary',
  loading = false,
  className = '',
  type = 'button',
  disabled = false,
  ...props
}) {
  const variantClasses = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-slate-400',
    secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:bg-slate-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 disabled:bg-transparent',
  }

  return (
    <button
      type={type}
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
      disabled={loading || disabled}
    >
      {loading && <LoadingSpinner />}
      <span>{children}</span>
    </button>
  )
}
