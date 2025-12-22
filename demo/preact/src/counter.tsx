import { reduxDevtools } from "@yaasl/devtools"
import {
  createAtom,
  CONFIG,
  expiration,
  indexedDb,
  useAtom,
  sync,
} from "@yaasl/preact"

CONFIG.name = "demo-preact"

const counter = createAtom({
  name: "counter",
  defaultValue: { value: 0 },
  effects: [
    // localStorage(),
    indexedDb(),
    expiration({ expiresIn: 5000 }),
    sync(),
    reduxDevtools(),
  ],
})

counter.subscribe(value => console.log("counter", value))

export const Counter = () => {
  const { value } = useAtom(counter)

  const onClick = () => counter.set(({ value }) => ({ value: value + 1 }))

  return <button onClick={onClick}>count is {value}</button>
}
