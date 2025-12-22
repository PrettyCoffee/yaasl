import { createSlice, useAtom } from "@yaasl/react"

/// [toastList]
interface ToastProps {
  id: string
  kind: "success" | "error"
  message: string
  duration?: number
}

const toastList = createSlice({
  name: "toast-list",
  defaultValue: [] as ToastProps[],
  reducers: {
    add: (state, toast: ToastProps) => [...state, toast],
    close: (state, id: string) => state.filter(toast => toast.id !== id),
  },
})
/// [toastList]

/// [showToast]
const createId = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(10)))
    .map(n => n.toString(36))
    .join("")
    .toUpperCase()

export const showToast = (toast: Omit<ToastProps, "id">) => {
  const id = createId()
  toastList.actions.add({ ...toast, id })
  if (toast.duration) {
    setTimeout(() => toastList.actions.close(id), toast.duration)
  }
}
/// [showToast]

/// [showToastUsage]
fetch("https://some-api.com")
  .then(/* do something */)
  .catch(() =>
    showToast({
      kind: "error",
      message: "Failed to load data",
    })
  )
/// [showToastUsage]

/// [useToasts]
export const useToasts = () => {
  const toasts = useAtom(toastList)
  return { toasts, close: toastList.actions.close }
}
/// [useToasts]

/// [useToastsUsage]
export const Toaster = () => {
  const { toasts, close } = useToasts()

  return (
    <div>
      {toasts.map(({ id, kind, message }) => (
        <div key={id} className={`toast ${kind}`}>
          <strong>{message}</strong>
          <button onClick={() => close(id)}>✖️</button>
        </div>
      ))}
    </div>
  )
}
/// [useToastsUsage]
