export default function Toast({ toast, onClose }) {
  const variantClasses = {
    success: 'border-green-200 bg-green-50 text-green-800',
    error: 'border-red-200 bg-red-50 text-red-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
  }

  return (
    <div className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-card ${variantClasses[toast.type] || variantClasses.info}`}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{toast.title}</p>
          {toast.message && <p className="mt-1 text-sm leading-relaxed opacity-90">{toast.message}</p>}
        </div>
        <button className="text-sm font-semibold opacity-70 transition hover:opacity-100" onClick={() => onClose(toast.id)}>
          ×
        </button>
      </div>
    </div>
  )
}
