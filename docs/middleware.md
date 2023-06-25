# yaasl/middleware

<!-- >> TOC >> -->

- [yaasl/middleware](#yaasl/middleware)
  - [middleware](#middleware) [ [API](#api), [Usage Examples](#usage-examples) ]
  - [localStorage](#localstorage) [ [API](#api-1), [Usage Examples](#usage-examples-1) ]
  <!-- << TOC << -->

## middleware

Create middlewares to be used in combination with a atoms.

### API

Parameters:

- `hook`: Callback that is fired when the atom changes in a store.

Returns: A middleware function to be used in atoms

- `atom.defaultValue`: Value that will be returned if the atom is not defined in the store
- `atom.toString`: Returns the unique name of the atom
- `atom.middleware`: Middleware that will be applied on the atom

### Usage Examples

```ts
const logger = middleware(({ type, store, atom, value }) => {
  console.log(
    `${store.toString()} emitted action ${type} for atom ${atom.toString()} and set its value to ${
      value ?? "undefined"
    }`
  );
});

const myAtom = atom({
  defaultValue: "my-value",
  middleware: [logger()],
});

interface Options {
  disable?: boolean;
}
const loggerWithOptions = middleware<Options>(
  ({ type, store, atom, value, options }) => {
    if (!options.disable)
      console.log(
        `${store.toString()} emitted action ${type} for atom ${atom.toString()} and set its value to ${
          value ?? "undefined"
        }`
      );
  }
);

const myAtom = atom({
  defaultValue: "my-value",
  middleware: [loggerWithOptions({ disable: true })],
});
```

## localStorage

Middleware to save and load atom values to the local storage.

### API

Parameters:

- `options.key`: Use your own key for the local storage.
  Will be "{config-name}{store-name}/{atom-name}" by default.

Returns: A middleware object

### Usage Examples

```ts
const atomWithStorage = atom({
  defaultValue: "my-value",
  middleware: [localStorage()],
});

const atomWithStorage = atom({
  defaultValue: "my-value",
  middleware: [localStorage({ key: "my-key" })],
});
```
