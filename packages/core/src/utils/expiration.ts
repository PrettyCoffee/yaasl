import { toVoid, getWindow } from "@yaasl/utils"

const STORAGE = getWindow()?.localStorage ?? {
  getItem: () => null,
  setItem: toVoid,
  removeItem: toVoid,
}

export interface ExpirationOptions {
  /** Local storage key to persist the expiration */
  key: string
  /** Date at which the value expires */
  expiresAt?: Date | (() => Date)
  /** Milliseconds in which the value expires. Will be ignored if expiresAt is set. */
  expiresIn?: number | (() => number)
}

export class Expiration {
  private readonly key: string
  private readonly getExpiration: (() => Date) | null

  private timeout: NodeJS.Timeout | null = null

  constructor({ key, expiresAt, expiresIn }: ExpirationOptions) {
    this.timeout = null
    this.key = key

    if (expiresAt) {
      this.getExpiration = () =>
        expiresAt instanceof Function ? expiresAt() : expiresAt
    } else if (expiresIn) {
      this.getExpiration = () => {
        const afterMs = expiresIn instanceof Function ? expiresIn() : expiresIn
        return new Date(Date.now() + afterMs)
      }
    } else {
      this.getExpiration = null
    }
  }

  public remove() {
    STORAGE.removeItem(this.key)
    if (this.timeout != null) {
      clearTimeout(this.timeout)
      this.timeout = null
    }
  }

  private dispatchExpiration = (expiresIn: number, onExpire: () => void) => {
    this.timeout = setTimeout(() => {
      onExpire()
      this.remove()
    }, expiresIn)
  }

  public init(onExpire: () => void) {
    if (!this.getExpiration) return

    const existing = STORAGE.getItem(this.key)
    if (!existing) {
      this.remove()
      return
    }
    const expiresIn = Number(existing) - Date.now()

    const isExpired = Number.isNaN(expiresIn) || expiresIn <= 0
    if (isExpired) {
      onExpire()
      this.remove()
    } else {
      this.dispatchExpiration(expiresIn, onExpire)
    }
  }

  public set(onExpire: () => void) {
    this.remove()
    if (!this.getExpiration) return

    const expiration = this.getExpiration()
    const expiresIn = Number(expiration) - Date.now()
    this.dispatchExpiration(expiresIn, onExpire)
    STORAGE.setItem(this.key, String(expiration.valueOf()))
  }
}
