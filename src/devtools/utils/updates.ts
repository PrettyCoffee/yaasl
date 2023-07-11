let paused = false

export const updates = {
  pause: () => (paused = true),
  resume: () => (paused = false),
  isPaused: () => paused,
}
