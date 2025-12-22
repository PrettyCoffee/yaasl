# yaasl - yet another atomic store library

[![license](https://badgen.net/npm/license/@yaasl/core)](https://github.com/PrettyCoffee/yaasl/blob/main/LICENSE) [![NPM Version](https://badgen.net/npm/v/@yaasl/core)](https://www.npmjs.com/package/@yaasl/core) ![NPM Downloads](https://badgen.net/npm/dw/@yaasl/core) [![minzipped size](https://badgen.net/bundlephobia/minzip/@yaasl/core)](https://bundlephobia.com/package/@yaasl/core)

<!-- >> TOC >> -->

- [yaasl - yet another atomic store library](#yaasl---yet-another-atomic-store-library)
  - [Motivation](#motivation)
  - [Installation](#installation)
  - [Quickstart](#quickstart)
  - [Usage examples](#usage-examples) [ [Vanilla typescript](#vanilla-typescript), [React (or Preact)](#react-or-preact) ]

<!-- << TOC << -->

This project is meant for personal use.
I won't stop you from using it, but I would rather recommend to use a similar
and more mature solution like [jotai](https://jotai.org/).

See the [docs](https://prettycoffee.github.io/yaasl/) for detailed documentation.

## Motivation

TL;DR - It's fun and I dislike the jotai API.

> Note: Jotai is really cool, and I love the work of dai-shi generally.

See [this page](https://prettycoffee.github.io/yaasl/#/pages/motivation) for a full explanation.

## Installation

You can install a yaasl package like you would do with any other:

```sh
npm i @yaasl/<package>
```

Available packages:

| Name                                                             | Description                           |
| ---------------------------------------------------------------- | ------------------------------------- |
| [@yaasl/core](https://www.npmjs.com/package/@yaasl/core)         | Core package for vanilla JS.          |
| [@yaasl/devtools](https://www.npmjs.com/package/@yaasl/devtools) | Adapter to use redux browser devtools |
| [@yaasl/react](https://www.npmjs.com/package/@yaasl/react)       | React bindings for `yaasl`.           |
| [@yaasl/preact](https://www.npmjs.com/package/@yaasl/preact)     | Preact bindings for `yaasl`.          |

## Quickstart

1. Pick one of the main packages

```sh
npm i @yaasl/core
npm i @yaasl/react
npm i @yaasl/preact
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

### React (or Preact)

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
