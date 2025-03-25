import { reduxDevtools } from "@yaasl/devtools"
import {
  createAtom,
  CONFIG,
  localStorage,
  useAtom,
  expiration,
  indexedDb,
} from "@yaasl/preact"

CONFIG.name = "demo-preact"

const counter = createAtom({
  name: "counter",
  defaultValue: 0,
  effects: [
    localStorage(),
    indexedDb(),
    expiration({ expiresIn: 5000 }),
    reduxDevtools(),
  ],
})

counter.subscribe(value => console.log("counter", value))

export const Counter = () => {
  const [value, setValue] = useAtom(counter)

  const onClick = () => setValue(previous => previous + 1)

  return <button onClick={onClick}>count is {value}</button>
}
