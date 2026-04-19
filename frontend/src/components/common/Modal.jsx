export default function Modal({ open, title, children, footer, onClose }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="surface-card w-full max-w-lg p-5 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        {title && <h3 className="text-lg font-bold text-ubuntu-text">{title}</h3>}
        <div className={title ? 'mt-4' : ''}>{children}</div>
        {footer && <div className="mt-5 flex items-center justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}
