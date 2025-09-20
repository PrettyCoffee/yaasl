import { getWindow } from "@yaasl/utils"

import { createEffect } from "./create-effect"
import { CONFIG } from "../base"

interface Payload<TData> {
  id: string
  data: TData
}
const getId = () =>
  getWindow()?.crypto.randomUUID() ?? Math.random().toString(36).slice(2, 10)

const getChannelName = (key: string) =>
  ["yaasl", "sync-channel", CONFIG.name, key].filter(Boolean).join("/")

class SyncChannel<TData = undefined> {
  static id = getId()
  private channel: BroadcastChannel
  private listeners = new Set<(data: TData) => void>()

  constructor(key: string) {
    this.channel = new BroadcastChannel(getChannelName(key))
    this.channel.onmessage = event => {
      const { id, data } = event.data as Payload<TData>
      if (id === SyncChannel.id) return
      this.listeners.forEach(listener => listener(data))
    }
  }

  public push(data: TData) {
    this.channel.postMessage({
      id: SyncChannel.id,
      data,
    } satisfies Payload<TData>)
  }

  public subscribe(listener: (data: TData) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}

/** Effect to synchronize the atoms value over tabs.
 *
 * @returns The effect to be used on atoms.
 **/
export const sync = createEffect(({ atom }) => {
  const channel = new SyncChannel<unknown>(atom.name)
  let skip = false
  return {
    didInit: () => {
      channel.subscribe(data => {
        atom.set(data)
        skip = true
      })
    },
    set: ({ value }) => {
      if (skip) {
        skip = false
        return
      }
      channel.push(value)
    },
  }
})
