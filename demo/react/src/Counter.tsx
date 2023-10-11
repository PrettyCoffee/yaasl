import { atom, CONFIG, reduxDevtools, localStorage, useAtom, indexedDb } from "yaasl/react"

CONFIG.name = "demo-react"

const counter = atom({
  name: "counter",
  defaultValue: 0,
  middleware: [localStorage({ expiresIn: 5000 }), indexedDb(), reduxDevtools()]
})

export const Counter = () => {
  const [value, setValue] = useAtom(counter);

  const onClick = () => setValue((previous) => previous + 1);

  return <button onClick={onClick}>count is {value}</button>;
};
