const isBrowserEnv = () => typeof window !== "undefined"

export const getWindow = () => (isBrowserEnv() ? window : undefined)
