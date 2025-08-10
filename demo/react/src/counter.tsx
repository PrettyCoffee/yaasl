import { reduxDevtools } from "@yaasl/devtools"
import {
  createAtom,
  CONFIG,
  indexedDb,
  expiration,
  useAtomValue,
} from "@yaasl/react"

CONFIG.name = "demo-react"

const counter = createAtom({
  name: "counter",
  defaultValue: { value: 0 },
  effects: [
    // localStorage(),
    indexedDb(),
    expiration({ expiresIn: 5000 }),
    reduxDevtools(),
  ],
})

counter.subscribe(value => console.log("counter", value))

export const Counter = () => {
  const { value } = useAtomValue(counter)

  const onClick = () => counter.set(({ value }) => ({ value: value + 1 }))

  return <button onClick={onClick}>count is {value}</button>
}
