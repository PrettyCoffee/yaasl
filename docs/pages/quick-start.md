# Quick start

<!-- prettier-ignore-start -->
1. Install one of the main packages

  <!-- tabs:start -->

  ### **@yaasl/core**

  Core package for vanilla JS.

  ```sh
  npm i @yaasl/core
  ```

  ### **@yaasl/react**

  React bindings for yaasl.

  ```sh
  npm i @yaasl/react
  ```

  ### **@yaasl/preact**

  Preact bindings for yaasl.

  ```sh
  npm i @yaasl/preact
  ```

  <!-- tabs:end -->

2. Create an atom

  ```ts
  import { createAtom } from "@yaasl/core"; // or "@yaasl/react" or "@yaasl/preact"

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
<!-- prettier-ignore-end -->

## Examples

<!-- tabs:start -->

### **Typescript**

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

const setupCounter = (element: HTMLButtonElement) => {
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
};

const counter = document.getElementById("counter");
setupCounter(counter);
```

### **React (or Preact)**

```tsx
import { createAtom, CONFIG, localStorage, useAtom } from "@yaasl/react"; // or "@yaasl/preact"

// Provide an app name to yaasl
CONFIG.name = "demo-react";

// Create a counter atom that is connected to the local storage
const counter = createAtom({
  name: "counter", // local storage key will be "demo-react/counter"
  defaultValue: 0,
  effects: [localStorage()],
});

export const Counter = () => {
  // Use the atom like you would use a state
  const value = useAtomValue(counter);

  const onClick = () => counter.set((previous) => previous + 1);

  return <button onClick={onClick}>count is {value}</button>;
};
```

<!-- tabs:end -->
