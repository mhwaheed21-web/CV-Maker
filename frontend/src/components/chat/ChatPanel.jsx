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
    <section className="flex h-full flex-col rounded-xl2 border border-ubuntu-border bg-ubuntu-surface p-4 shadow-soft">
      <div className="mb-3 border-b border-ubuntu-border pb-3">
        <h3 className="text-sm font-bold text-ubuntu-text">Conversation</h3>
        <p className="mt-1 text-xs text-ubuntu-muted">Messages are saved with this CV revision.</p>
      </div>

      <div className="mb-3 flex-1 space-y-2 overflow-y-auto pr-1">
        {loadingChat ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl2 bg-ubuntu-surfaceAlt" />
            ))}
          </div>
        ) : chatMessages.length === 0 ? (
          <p className="rounded-xl2 border border-ubuntu-border bg-ubuntu-surfaceAlt px-3 py-2 text-sm text-ubuntu-muted">
            No messages yet. Ask for edits or clarifications below.
          </p>
        ) : (
          chatMessages.map((message) => <ChatMessage key={message.id} message={message} />)
        )}
      </div>

      <div className="space-y-2 border-t border-ubuntu-border pt-3">
        <textarea
          className="min-h-28 w-full rounded-xl2 border border-ubuntu-border bg-ubuntu-surfaceAlt px-3 py-2 text-sm text-ubuntu-text placeholder:text-ubuntu-muted/80 outline-none transition-all duration-250 ease-in-out focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-70"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask a follow-up or request a change..."
          rows={4}
          disabled={sendingChat}
        />

        {chatError && (
          <p className="rounded-xl2 border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {chatError}
          </p>
        )}

        <button
          className="inline-flex h-11 min-w-[44px] w-full items-center justify-center rounded-xl2 bg-brand-500 px-4 text-sm font-semibold text-white shadow-soft transition-all duration-250 ease-in-out hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-ubuntu-surfaceAlt"
          onClick={onSend}
          disabled={sendingChat || !chatInput.trim()}
        >
          {sendingChat ? 'Sending...' : 'Send Message'}
        </button>
      </div>
    </section>
  )
}
