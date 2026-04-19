import { create } from 'zustand'

let toastCounter = 0

const useToastStore = create((set, get) => ({
  toasts: [],
  addToast: (toast) => {
    const id = ++toastCounter
    const nextToast = {
      id,
      type: 'info',
      title: '',
      message: '',
      duration: 3000,
      ...toast,
    }

    set((state) => ({ toasts: [...state.toasts, nextToast] }))

    window.setTimeout(() => {
      const currentToasts = get().toasts
      if (currentToasts.some((item) => item.id === id)) {
        get().removeToast(id)
      }
    }, nextToast.duration)

    return id
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
  success: (title, message, options = {}) => get().addToast({ type: 'success', title, message, ...options }),
  error: (title, message, options = {}) => get().addToast({ type: 'error', title, message, ...options }),
  info: (title, message, options = {}) => get().addToast({ type: 'info', title, message, ...options }),
  warning: (title, message, options = {}) => get().addToast({ type: 'warning', title, message, ...options }),
}))

export default useToastStore
