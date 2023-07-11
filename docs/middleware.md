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

- `setup`: Middleware actions or function to create middleware actions. Middleware actions are fired in the atom lifecycle, alongside to the subscriptions.

Returns: A middleware function to be used in atoms.

### Usage Examples

```ts
// Create a middleware
const logger = middleware({
  init: ({ atom, store }) =>
    console.log(
      `Initiated atom "${atom.toString()}" in store "${store.toString()}"`
    ),
  set: ({ atom, store, value }) =>
    console.log(
      `Value of atom "${atom.toString()}" in store "${store.toString()}" was set to:`,
      value
    ),
  remove: ({ atom, store }) =>
    console.log(
      `Remove atom "${atom.toString()}" from store "${store.toString()}"`
    ),
});

const myAtom = atom({
  defaultValue: "my-value",
  middleware: [logger()],
});

// Create a middleware that has options
interface Options {
  disable?: boolean;
}
const loggerWithOptions = middleware<Options>(({ options, atom }) => {
  if (options.disable) return {};
  const atomName = atom.toString();

  return {
    init: ({ store }) =>
      console.log(
        `Initiated atom "${atomName}" in store "${store.toString()}"`
      ),
    set: ({ store, value }) =>
      console.log(
        `Value of atom "${atomName}" in store "${store.toString()}" was set to:`,
        value
      ),
    remove: ({ store }) =>
      console.log(`Remove atom "${atomName}" from store "${store.toString()}"`),
  };
});

const myAtom = atom({
  defaultValue: "my-value",
  middleware: [loggerWithOptions({ disable: true })],
});
```

## localStorage

Middleware to save and load atom values to the local storage.

### API

Parameters:

- `options.key`: Use your own key for the local storage. Will be "{config-name}/{atom-name}" by default.
- `options.noTabSync`: Disable the synchronization of values over browser tabs.

Returns: The middleware to be used on atoms.

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
