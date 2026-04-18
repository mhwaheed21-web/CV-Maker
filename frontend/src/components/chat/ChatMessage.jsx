export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  return (
    <div
      className={`rounded-xl border px-3 py-2 ${
        isUser
          ? 'border-indigo-200 bg-indigo-50'
          : 'border-slate-200 bg-slate-50'
      }`}
    >
      <div className="mb-1 flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        <span>{message.role}</span>
        <span>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{message.content}</p>
    </div>
  )
}
