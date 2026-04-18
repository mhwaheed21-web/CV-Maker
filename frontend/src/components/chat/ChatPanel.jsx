import ChatMessage from './ChatMessage'

export default function ChatPanel({
  loadingChat,
  chatMessages,
  chatInput,
  setChatInput,
  sendingChat,
  chatError,
  onSend,
  onKeyDown,
}) {
  return (
    <section className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900">Conversation</h3>
        <p className="mt-1 text-xs text-slate-500">Messages are saved with this CV revision.</p>
      </div>

      <div className="mb-3 flex-1 space-y-2 overflow-y-auto pr-1">
        {loadingChat ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : chatMessages.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
            No messages yet. Ask for edits or clarifications below.
          </p>
        ) : (
          chatMessages.map((message) => <ChatMessage key={message.id} message={message} />)
        )}
      </div>

      <div className="space-y-2 border-t border-slate-100 pt-3">
        <textarea
          className="min-h-28 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask a follow-up or request a change..."
          rows={4}
          disabled={sendingChat}
        />

        {chatError && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {chatError}
          </p>
        )}

        <button
          className="inline-flex h-11 min-w-[44px] w-full items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          onClick={onSend}
          disabled={sendingChat || !chatInput.trim()}
        >
          {sendingChat ? 'Sending...' : 'Send Message'}
        </button>
      </div>
    </section>
  )
}
