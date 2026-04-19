export default function Toast({ toast, onClose }) {
  const variantClasses = {
    success: 'border-green-400/40 bg-green-500/10 text-green-200',
    error: 'border-red-400/40 bg-red-500/10 text-red-200',
    info: 'border-brand-400/40 bg-brand-500/10 text-brand-100',
    warning: 'border-amber-400/40 bg-amber-500/10 text-amber-200',
  }

  return (
    <div className={`pointer-events-auto rounded-xl2 border px-4 py-3 shadow-soft backdrop-blur-sm ${variantClasses[toast.type] || variantClasses.info}`}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{toast.title}</p>
          {toast.message && <p className="mt-1 whitespace-pre-line text-sm leading-relaxed opacity-90">{toast.message}</p>}
        </div>
        <button className="text-sm font-semibold opacity-70 transition-all duration-250 ease-in-out hover:opacity-100" onClick={() => onClose(toast.id)}>
          ×
        </button>
      </div>
    </div>
  )
}
