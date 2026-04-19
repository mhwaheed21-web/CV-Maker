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
    primary: 'bg-brand-500 text-white shadow-soft hover:bg-brand-600 disabled:bg-ubuntu-surfaceAlt',
    secondary: 'border border-brand-500 bg-transparent text-brand-500 hover:bg-brand-500/10 disabled:border-ubuntu-border disabled:text-ubuntu-muted',
    danger: 'bg-red-600 text-white shadow-soft hover:bg-red-700 disabled:bg-red-900/40 disabled:text-red-100/70',
    ghost: 'bg-transparent text-ubuntu-muted hover:bg-ubuntu-surfaceAlt hover:text-ubuntu-text disabled:text-ubuntu-muted/70',
  }

  return (
    <button
      type={type}
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl2 px-4 py-2 text-sm font-semibold transition-all duration-250 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-ubuntu-background disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
      disabled={loading || disabled}
    >
      {loading && <LoadingSpinner />}
      <span>{children}</span>
    </button>
  )
}
