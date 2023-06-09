import { atom, CONFIG } from "yaasl/core"
import { reduxDevtools } from "yaasl/devtools"
import { localStorage } from "yaasl/middleware"
import { useAtom } from "yaasl/react"

CONFIG.name = "demo-react"

const counter = atom({
  name: "counter",
  defaultValue: 0,
  middleware: [localStorage(), reduxDevtools()]
})

export const Counter = () => {
  const [value, setValue] = useAtom(counter);

  const onClick = () => setValue((previous) => previous + 1);

  return <button onClick={onClick}>count is {value}</button>;
};
