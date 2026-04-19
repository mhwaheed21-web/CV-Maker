export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  return (
    <div
      className={`rounded-xl2 border px-3 py-2 ${
        isUser
          ? 'border-brand-400/40 bg-brand-500/10'
          : 'border-ubuntu-border bg-ubuntu-surfaceAlt'
      }`}
    >
      <div className="mb-1 flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-wide text-ubuntu-muted">
        <span>{message.role}</span>
        <span>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-ubuntu-text">{message.content}</p>
    </div>
  )
}
