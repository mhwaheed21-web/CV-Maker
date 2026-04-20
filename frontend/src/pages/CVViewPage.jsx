import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { getCV, downloadCV, previewCVUrl, regenerateCV, getCVStatus } from '../api/cvs'
import { processChatMessage, getChatMessages } from '../api/chat'
import { getTemplates } from '../api/templates'
import ChatPanel from '../components/chat/ChatPanel'

export default function CVViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || 'cvs'
  const [cv, setCv] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [showRegenerateModal, setShowRegenerateModal] = useState(false)
  const [templates, setTemplates] = useState([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [regenerateError, setRegenerateError] = useState('')
  const [regenerateStatus, setRegenerateStatus] = useState('')
  const [previewVersion, setPreviewVersion] = useState(0)
  const [formData, setFormData] = useState({ title: '', job_description: '', template_id: 'minimal' })
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [loadingChat, setLoadingChat] = useState(true)
  const [sendingChat, setSendingChat] = useState(false)
  const [chatError, setChatError] = useState('')
  const [showMobileChat, setShowMobileChat] = useState(false)

  useEffect(() => {
    getCV(id)
      .then((res) => {
        setCv(res.data)
        setFormData({
          title: res.data.title,
          job_description: res.data.job_description,
          template_id: res.data.template_id,
        })
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    getTemplates()
      .then((res) => {
        setTemplates(res.data)
        setLoadingTemplates(false)
      })
      .catch((err) => {
        console.error('Failed to load templates:', err)
        setLoadingTemplates(false)
      })
  }, [])

  useEffect(() => {
    getChatMessages(id)
      .then((res) => {
        setChatMessages(res.data)
        setLoadingChat(false)
      })
      .catch((err) => {
        console.error('Failed to load chat history:', err)
        setChatError('Failed to load chat history')
        setLoadingChat(false)
      })
  }, [id])

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const res = await downloadCV(id)
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${cv?.title || 'cv'}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    } finally {
      setDownloading(false)
    }
  }

  const handleRegenerate = async () => {
    setRegenerateError('')
    setRegenerateStatus('Regenerating...')
    setRegenerating(true)

    try {
      await regenerateCV(id, {
        title: formData.title !== cv.title ? formData.title : undefined,
        job_description: formData.job_description !== cv.job_description ? formData.job_description : undefined,
        template_id: formData.template_id !== cv.template_id ? formData.template_id : undefined,
      })

      // Poll for status updates
      let isComplete = false
      let attempts = 0
      const maxAttempts = 60 // 2 minutes max

      while (!isComplete && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        attempts++

        try {
          const statusRes = await getCVStatus(id)
          const status = statusRes.data.status

          if (status === 'complete') {
            setRegenerateStatus('CV regenerated successfully!')
            setRegenerating(false)
            setShowRegenerateModal(false)
            // Refresh CV data
            const updatedCV = await getCV(id)
            setCv(updatedCV.data)
            setPreviewVersion((currentVersion) => currentVersion + 1)
            isComplete = true
          } else if (status === 'failed') {
            setRegenerateError('Regeneration failed. Please try again.')
            setRegenerating(false)
            isComplete = true
          } else {
            setRegenerateStatus(`Regenerating... (${attempts * 2}s)`)
          }
        } catch (err) {
          console.error('Status polling error:', err)
        }
      }

      if (!isComplete) {
        setRegenerateError('Regeneration timeout. Please check back in a moment.')
        setRegenerating(false)
      }
    } catch (err) {
      console.error('Regenerate error:', err)
      setRegenerateError(err.response?.data?.detail || 'Failed to regenerate CV')
      setRegenerating(false)
    }
  }

  const handleSendChatMessage = async () => {
    const content = chatInput.trim()
    if (!content || sendingChat) {
      return
    }

    setSendingChat(true)
    setChatError('')

    try {
      const res = await processChatMessage(id, {
        content,
        role: 'user',
      })

      const { user_message, assistant_message, cv_updated, profile_updated } = res.data

      setChatMessages((currentMessages) => [
        ...currentMessages,
        user_message,
        assistant_message,
      ])

      if (cv_updated || profile_updated) {
        const updatedCV = await getCV(id)
        setCv(updatedCV.data)
        setPreviewVersion((currentVersion) => currentVersion + 1)
      }

      setChatInput('')
    } catch (err) {
      console.error('Failed to send chat message:', err)
      setChatError(err.response?.data?.detail || 'Failed to send message')
    } finally {
      setSendingChat(false)
    }
  }

  const handleChatKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendChatMessage()
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[280px_minmax(0,1fr)_340px]">
          <div className="surface-card animate-pulse p-5">
            <div className="mb-3 h-10 rounded-xl2 bg-ubuntu-surfaceAlt" />
            <div className="mb-2 h-5 w-36 rounded bg-ubuntu-surfaceAlt" />
            <div className="mb-2 h-3 w-24 rounded bg-ubuntu-surfaceAlt" />
            <div className="h-24 rounded bg-ubuntu-surfaceAlt" />
          </div>
          <div className="surface-card animate-pulse p-5">
            <div className="h-[70vh] rounded-xl2 bg-ubuntu-surfaceAlt" />
          </div>
          <div className="surface-card hidden animate-pulse p-5 xl:block">
            <div className="mb-2 h-5 w-32 rounded bg-ubuntu-surfaceAlt" />
            <div className="h-[70vh] rounded-xl2 bg-ubuntu-surfaceAlt" />
          </div>
        </div>
      </div>
    )
  }

  if (!cv) {
    return (
      <div className="mx-auto w-full max-w-4xl p-6">
        <div className="surface-card p-6 text-center">
          <p className="text-base font-semibold text-ubuntu-text">CV not found</p>
          <p className="mt-2 text-sm text-ubuntu-muted">This CV may have been deleted or is inaccessible.</p>
          <button
            className="mt-4 inline-flex h-11 min-w-[44px] items-center justify-center rounded-xl2 bg-brand-500 px-4 text-sm font-semibold text-white shadow-soft transition-all duration-250 ease-in-out hover:bg-brand-600"
            onClick={() => navigate('/dashboard', { state: { page: from } })}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const previewUrl = `${previewCVUrl(id)}?token=${localStorage.getItem('access_token')}&v=${previewVersion}`

  const statusBadgeClass =
    cv.status === 'complete'
      ? 'border-green-400/40 bg-green-500/10 text-green-200'
      : cv.status === 'failed'
        ? 'border-red-400/40 bg-red-500/10 text-red-200'
        : 'border-amber-400/40 bg-amber-500/10 text-amber-200'

  return (
    <div className="mx-auto w-full max-w-[1800px] p-3 sm:p-4 lg:p-6">
      <div className="mb-3 flex items-center justify-between xl:hidden">
        <button
          className="inline-flex h-10 min-w-[44px] items-center justify-center rounded-xl2 border border-ubuntu-border bg-ubuntu-surfaceAlt px-3 text-sm font-medium text-ubuntu-muted transition-all duration-250 ease-in-out hover:text-ubuntu-text"
          onClick={() => navigate('/dashboard', { state: { page: from } })}
        >
          ← Back
        </button>
        <button
          className="inline-flex h-10 min-w-[44px] items-center justify-center rounded-xl2 bg-brand-500 px-3 text-sm font-semibold text-white shadow-soft transition-all duration-250 ease-in-out hover:bg-brand-600"
          onClick={() => setShowMobileChat(true)}
        >
          Open Chat
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[280px_minmax(0,1fr)_340px]">
        <aside className="surface-card h-fit space-y-4 p-4">
          <button
            className="hidden h-10 min-w-[44px] items-center justify-center rounded-xl2 border border-ubuntu-border bg-ubuntu-surfaceAlt px-3 text-sm font-medium text-ubuntu-muted transition-all duration-250 ease-in-out hover:text-ubuntu-text xl:inline-flex"
            onClick={() => navigate('/dashboard', { state: { page: from } })}
          >
            ← Back
          </button>

          <div>
            <h2 className="line-clamp-2 text-lg font-bold text-ubuntu-text">{cv.title}</h2>
            <div className="mt-3 space-y-2 text-xs">
              <div>
                <p className="mb-1 font-semibold uppercase tracking-wide text-ubuntu-muted">Status</p>
                <span className={`inline-flex rounded-full border px-2.5 py-1 font-semibold uppercase ${statusBadgeClass}`}>
                  {cv.status}
                </span>
              </div>
              <div>
                <p className="mb-1 font-semibold uppercase tracking-wide text-ubuntu-muted">Created</p>
                <p className="text-sm text-ubuntu-text">{new Date(cv.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="mb-1 font-semibold uppercase tracking-wide text-ubuntu-muted">Job Description</p>
                <p className="line-clamp-[12] text-sm leading-relaxed text-ubuntu-muted">{cv.job_description}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button
              className="inline-flex h-11 min-w-[44px] w-full items-center justify-center rounded-xl2 bg-brand-500 px-4 text-sm font-semibold text-white shadow-soft transition-all duration-250 ease-in-out hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-ubuntu-surfaceAlt"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? 'Downloading...' : 'Download PDF'}
            </button>

            <button
              className="inline-flex h-11 min-w-[44px] w-full items-center justify-center rounded-xl2 border border-brand-500 bg-transparent px-4 text-sm font-semibold text-brand-500 transition-all duration-250 ease-in-out hover:bg-brand-500/10 disabled:cursor-not-allowed disabled:border-ubuntu-border disabled:text-ubuntu-muted"
              onClick={() => setShowRegenerateModal(true)}
              disabled={regenerating}
            >
              Regenerate
            </button>
          </div>
        </aside>

        <section className="surface-card min-h-[75vh] p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between">
            {/* <p className="text-xs font-semibold uppercase tracking-wide text-ubuntu-muted">Live Preview</p> */}
            {/* <p className="text-xs text-ubuntu-muted/80">Version {previewVersion + 1}</p> */}
          </div>
          <div className="h-[72vh] overflow-hidden rounded-xl2 border border-ubuntu-border bg-white shadow-soft">
            <iframe src={previewUrl} className="h-full w-full" title="CV Preview" />
          </div>
        </section>

        <div className="hidden xl:block">
          <ChatPanel
            loadingChat={loadingChat}
            chatMessages={chatMessages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            sendingChat={sendingChat}
            chatError={chatError}
            onSend={handleSendChatMessage}
            onKeyDown={handleChatKeyDown}
          />
        </div>
      </div>

      {showMobileChat && (
        <div
          className="fixed inset-0 z-50 flex bg-black/70 p-3 xl:hidden"
          onClick={() => setShowMobileChat(false)}
        >
          <div className="ml-auto flex h-full w-full max-w-md flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex justify-end">
              <button
                className="inline-flex h-9 min-w-[44px] items-center justify-center rounded-xl2 border border-ubuntu-border bg-ubuntu-surface px-3 text-xs font-semibold text-ubuntu-muted"
                onClick={() => setShowMobileChat(false)}
              >
                Close
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <ChatPanel
                loadingChat={loadingChat}
                chatMessages={chatMessages}
                chatInput={chatInput}
                setChatInput={setChatInput}
                sendingChat={sendingChat}
                chatError={chatError}
                onSend={handleSendChatMessage}
                onKeyDown={handleChatKeyDown}
              />
            </div>
          </div>
        </div>
      )}

      {showRegenerateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => !regenerating && setShowRegenerateModal(false)}
        >
          <div
            className="surface-card max-h-[92vh] w-full max-w-2xl overflow-y-auto p-5 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-ubuntu-text">Regenerate CV</h3>

            <label className="mt-4 mb-1 block text-sm font-semibold text-ubuntu-muted">CV Title</label>
            <input
              className="h-11 w-full rounded-xl2 border border-ubuntu-border bg-ubuntu-surfaceAlt px-4 text-sm text-ubuntu-text outline-none transition-all duration-250 ease-in-out focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-70"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={regenerating}
            />

            <label className="mt-4 mb-1 block text-sm font-semibold text-ubuntu-muted">Template</label>
            {loadingTemplates ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded-xl2 bg-ubuntu-surfaceAlt" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    className={`rounded-xl2 border-2 px-3 py-2 text-xs font-semibold transition-all duration-250 ease-in-out ${
                      formData.template_id === template.id
                        ? 'border-brand-500 bg-brand-500/15 text-brand-100'
                        : 'border-ubuntu-border bg-ubuntu-surfaceAlt text-ubuntu-muted hover:border-brand-500/40 hover:text-ubuntu-text'
                    }`}
                    onClick={() => !regenerating && setFormData({ ...formData, template_id: template.id })}
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            )}

            <label className="mt-4 mb-1 block text-sm font-semibold text-ubuntu-muted">Job Description</label>
            <textarea
              className="min-h-40 w-full rounded-xl2 border border-ubuntu-border bg-ubuntu-surfaceAlt px-4 py-3 text-sm leading-relaxed text-ubuntu-text outline-none transition-all duration-250 ease-in-out focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-70"
              value={formData.job_description}
              onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
              rows={6}
              disabled={regenerating}
            />

            {regenerateError && (
              <p className="mt-3 rounded-xl2 border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {regenerateError}
              </p>
            )}

            {regenerating && (
              <div className="mt-3 flex items-center gap-3 rounded-xl2 border border-brand-400/40 bg-brand-500/10 px-4 py-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-300/40 border-t-brand-500" />
                <p className="text-sm font-medium text-brand-100">{regenerateStatus}</p>
              </div>
            )}

            {!regenerating && (
              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button
                  className="inline-flex h-10 min-w-[44px] items-center justify-center rounded-xl2 border border-ubuntu-border bg-ubuntu-surfaceAlt px-4 text-sm font-medium text-ubuntu-muted transition-all duration-250 ease-in-out hover:text-ubuntu-text"
                  onClick={() => setShowRegenerateModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="inline-flex h-10 min-w-[44px] items-center justify-center rounded-xl2 bg-brand-500 px-4 text-sm font-semibold text-white shadow-soft transition-all duration-250 ease-in-out hover:bg-brand-600"
                  onClick={handleRegenerate}
                >
                  Regenerate
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}