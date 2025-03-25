/* eslint-disable no-restricted-globals */

const isBrowserEnv = () => typeof window !== "undefined"

export const getWindow = () => (isBrowserEnv() ? window : undefined)
