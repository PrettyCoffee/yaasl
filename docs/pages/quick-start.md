# Quick start

1. Pick one of the main packages

```sh
$ npm i @yaasl/core
$ npm i @yaasl/react
$ npm i @yaasl/preact
```

2. Create an atom

```ts
import { createAtom } from "@yaasl/core";

const myAtom = createAtom({ defaultValue: 0 });
```

3. Use the atom

```ts
// Read
const currentValue = myAtom.get(atom);
// Write
myAtom.set(nextValue);
// Subscribe to changes
myAtom.subscribe((value) => {
  console.log(value);
});
```

## Example: Typescript

```ts
import { createAtom, CONFIG, localStorage } from "@yaasl/core";

// Provide an app name to yaasl
CONFIG.name = "demo-vanilla";

// Create a counter atom that is connected to the local storage
const counter = createAtom({
  name: "counter", // local storage key will be "demo-vanilla/counter"
  defaultValue: 0,
  effects: [localStorage()],
});

function setupCounter(element: HTMLButtonElement) {
  const updateCounterText = (value: number) =>
    (element.innerHTML = `count is ${value}`);

  element.addEventListener("click", () => {
    // Set the value of the atom
    counter.set((previous) => previous + 1);
  });

  // Subscribe to value changes
  counter.subscribe((value) => updateCounterText(value));

  // Read the value of the atom in the store
  updateCounterText(counter.get());
}

const counter = document.getElementById("counter");
setupCounter(counter);
```

## Example: React (or Preact)

```tsx
import { createAtom, CONFIG, localStorage, useAtom } from "@yaasl/react"; // or "@yaasl/preact"

// Provide an app name to yaasl
CONFIG.name = "demo-react";

// Create a counter atom that is connected to the local storage
const counter = createAtom({
  name: "counter", // local storage key will be "demo-vanilla/counter"
  defaultValue: 0,
  effects: [localStorage()],
});

export const Counter = () => {
  // Use the atom like you would use a state
  const [value, setValue] = useAtom(counter);

  const onClick = () => setValue((previous) => previous + 1);

  return <button onClick={onClick}>count is {value}</button>;
};
```
