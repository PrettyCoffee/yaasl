import { CONFIG } from "../base"

export const getScopedKey = (key: string) =>
  CONFIG.name ? `${CONFIG.name}/${key}` : key
