# yaasl - yet another atomic store library

[![license](https://img.shields.io/github/license/PrettyCoffee/yaasl)](./LICENSE) [![NPM Version](https://img.shields.io/npm/v/%40yaasl%2Fcore)](https://www.npmjs.com/package/@yaasl/core) ![NPM Downloads](https://img.shields.io/npm/dw/%40yaasl%2Fcore)

<!-- >> TOC >> -->

- [yaasl - yet another atomic store library](#yaasl---yet-another-atomic-store-library)
  - [Packages](#packages)
  - [Quickstart](#quickstart)
  - [Usage examples](#usage-examples) [ [Vanilla typescript](#vanilla-typescript), [React (or Preact)](#react-or-preact) ]
  <!-- << TOC << -->

This project is meant for personal use.
I won't stop you from using it, but I would rather recommend to use a similar
and more mature solution like [jotai](https://jotai.org/).

See the [docs](https://prettycoffee.github.io/yaasl/)) for detailed documentation.

## Packages

| Name                                        | Description                           |
| ------------------------------------------- | ------------------------------------- |
| [@yaasl/core](./docs/pages/core.md)         | Core package for vanilla JS.          |
| [@yaasl/devtools](./docs/pages/devtools.md) | Adapter to use redux browser devtools |
| [@yaasl/react](./docs/pages/react.md)       | React bindings for `yaasl`.           |
| [@yaasl/preact](./docs/pages/preact.md)     | Preact bindings for `yaasl`.          |

## Quickstart

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

## Usage examples

### Vanilla typescript

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

### React (or Preact)

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
