# Middleware

<!-- >> TOC >> -->

- [Middleware](#middleware)
  - [middleware](#middleware) [ [API](#api), [Actions](#actions), [Usage Examples](#usage-examples) ]
  - [localStorage](#localstorage) [ [API](#api-1), [Usage Examples](#usage-examples-1) ]
  - [indexedDb](#indexeddb) [ [API](#api-2), [Usage Examples](#usage-examples-2) ]
  - [expiration](#expiration) [ [API](#api-3), [Usage Examples](#usage-examples-3) ]
  <!-- << TOC << -->

## middleware

Create middlewares to be used in combination with a atoms.

### API

Parameters:

- `setup`: Middleware actions or function to create middleware actions. Middleware actions are fired in the atom lifecycle, alongside to the subscriptions.

Returns: A middleware function to be used in atoms.

### Actions

When creating a middleware, you can use the following lifecycle actions:

- `init`: Action to be called when the atom is created, but before subscribing to `set` events.
- `didInit`: Action to be called when the atom is created, but after subscribing to `set` events.
- `set`: Action to be called when the atom's `set` function is called.

### Usage Examples

```ts
// Create a middleware
const logger = middleware({
  init: ({ atom }) => console.log(`Initiated atom "${atom.name}"`),
  didInit: ({ atom }) =>
    console.log(`Did finish initialization of atom "${atom.name}"`),
  set: ({ atom, value }) =>
    console.log(`Value of atom "${atom.name}" was set to:`, value),
});

const myAtom = atom({
  defaultValue: "my-value",
  middleware: [logger()],
});

// Create a middleware that has options
interface Options {
  disable?: boolean;
}
const loggerWithOptions = middleware<Options>(({ options }) => {
  if (options.disable) return {};

  return {
    init: ({ atom }) => console.log(`Initiated atom "${atom.name}"`),
    didInit: ({ atom }) =>
      console.log(`Did finish initialization of atom "${atom.name}"`),
    set: ({ atom, value }) =>
      console.log(`Value of atom "${atom.name}" was set to:`, value),
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
- `options.stringify`: Custom function to stringify a value. Defaults to JSON.stringify. Use this when handling complex datatypes like Maps or Sets.
- `options.parse`: Custom function to parse a string from the store. Defaults to JSON.parse. Use this when handling complex datatypes like Maps or Sets.

Returns: The middleware to be used on atoms.

### Usage Examples

```ts
const atomWithStorage = atom({
  defaultValue: "my-value",
  middleware: [localStorage()],
})

const atomWithStorage = atom({
  defaultValue: "my-value",
  middleware: [localStorage({ key: "my-key" })],
})

const isMapEntry = (value: unknown): value is [unknown, unknown] =>
  Array.isArray(value) && value.length === 2

const mapParser: LocalStorageParser<Map<unknown, unknown>> = {
  parse: text => {
    const value: unknown = JSON.parse(text)
    if (!Array.isArray(value) || !value.every(isMapEntry))
      throw new Error("LocalStorage value is not a valid Map object")

    return new Map(value)
  },
  stringify: value => JSON.stringify(Array.from(value.entries())),
}

const mapAtom = atom({
  defaultValue: new Map<string, string>()
  middleware: [localStorage({ parser: mapParser })],
})
```

## indexedDb

Middleware to save and load atom values to the local storage.

Will use one database and store for all atoms with your `CONFIG.name`
as name or `yaasl` if not set.

### API

Parameters:

- `options.key`: Use your own store key. Will be `atom.name` by default.

Returns: The middleware to be used on atoms.

### Usage Examples

```ts
const atomWithDb = atom({
  defaultValue: "my-value",
  middleware: [indexedDb()],
});

const atomWithDb = atom({
  defaultValue: "my-value",
  middleware: [indexedDb({ key: "my-key" })],
});
```

## expiration

Middleware to make an atom value expirable and reset to its defaulValue.

**Note:** When using `expiresAt`, a function returning the date should be prefered since using a static date might end in an infinite loop.

### API

Parameters:

- `options.expiresAt`: Date at which the value expires
- `options.expiresIn`: Milliseconds in which the value expires. Will be ignored if expiresAt is set.

Returns: The middleware to be used on atoms.

### Usage Examples

```ts
const tomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
};

const expiringAtom = atom({
  defaultValue: "my-value",
  middleware: [expiration({ expiresAt: tomorrow })],
});

const expiringAtom = atom({
  defaultValue: "my-value",
  middleware: [expiration({ expiresIn: 5000 })],
});
```
