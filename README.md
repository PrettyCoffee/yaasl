# yaasl - yet another atomic store library

[![license](https://img.shields.io/github/license/PrettyCoffee/yaasl)](./LICENSE)

This project is meant for personal use only.
I won't stop you from using it, but I would rather recommend to use a similar
and more solid solution like [jotai](https://jotai.org/) or [recoil](https://recoiljs.org/).

## Packages

| Name                                     | Description                                                                              |
| ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| [yaasl/core](./docs/core.md)             | Core package with javascript functions to create atomic states and middleware for atoms. |
| [yaasl/devtools](./docs/devtools.md)     | Devtools to debug `yaasl/core` atom states.                                              |
| [yaasl/middleware](./docs/middleware.md) | Atom middleware helper and presets.                                                      |
| [yaasl/react](./docs/react.md)           | React bindings for `yaasl/core`.                                                         |

## Quickstart

1. Install the package

```sh
$ npm i yaasl
```

2. Create an atom

```ts
import { atom } from "yaasl/core";

const myAtom = atom({ defaultValue: 0 });
```

3. Initiate the atom in a store

```ts
import { globalStore } from "yaasl/core";

// Use the global one
globalStore.init(myAtom);
```

4. Use the atom

```ts
// Read
const currentValue = globalStore.get(atom);
// Write
globalStore.set(atom, nextValue);
// Subscribe to changes
globalStore.subscribe(atom, ({ type, value }) => {
  if (type === "SET") {
    console(type, value);
  }
});
```

5. Delete the atom if you don't need it anymore

```ts
// Use the global one
globalStore.remove(myAtom);
```

## Usage examples

### Vanilla typescript

```ts
import { atom, globalStore } from "yaasl/core";
import { localStorage } from "yaasl/middleware";

/* Create a counter atom that is connected to the local storage */
const counter = atom({
  defaultValue: 0,
  middleware: [localStorage()],
});

/* Initiate the atom in a store */
globalStore.init(counter);

const setupCounter = (element: HTMLButtonElement) => {
  const setCounter = (value: number) => {
    /* Set the value of the atom in the store */
    globalStore.set(counter, value);
  };

  const updateCounterText = (value: number) =>
    (element.innerHTML = `count is ${value}`);

  /* Subscribe to value changes */
  globalStore.subscribe(
    counter,
    ({ type, value }) => type === "SET" && value && updateCounterText(value)
  );

  element.addEventListener("click", () =>
    setCounter(globalStore.get(counter) + 1)
  );

  // Read the value of the atom in the store
  updateCounterText(globalStore.get(counter));
};

const counter = document.getElementById("counter");
setupCounter(counter);
```

### React

```tsx
import { atom, globalStore } from "yaasl/core";
import { localStorage } from "yaasl/middleware";
import { useAtom } from "yaasl/react";

/* Create a counter atom that is connected to the local storage */
const counter = atom({
  defaultValue: 0,
  middleware: [localStorage()],
});

/* Initiate the atom in a store */
globalStore.init(counter);

const Counter = () => {
  const [value, setValue] = useAtom(counter);

  const onClick = () => setValue((value) => value + 1);

  return <button onClick={onClick}>count is {value}</button>;
};
```
