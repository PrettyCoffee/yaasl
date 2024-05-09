# Core

<!-- >> TOC >> -->

- [Core](#core)
  - [atom](#atom) [ [API](#api), [Usage Examples](#usage-examples) ]
  - [select](#select) [ [API](#api-1), [Usage Examples](#usage-examples-1) ]
  - [derive](#derive) [ [API](#api-2), [Usage Examples](#usage-examples-2) ]
  - [middleware](#middleware) [ [API](#api-3), [Usage Examples](#usage-examples-3) ]
  - [CONFIG](#config) [ [API](#api-4), [Usage Examples](#usage-examples-4) ]
  <!-- << TOC << -->

## atom

Creates an atom store.

### API

Parameters:

- `config.defaultValue`: Value that will be used initially.
- `config.name`: Name of the atom. Must be unique among all atoms. Defaults to "atom-{number}".
- `config.middleware`: Middleware that will be applied on the atom.

Returns: An atom instance.

- `result.get`: Read the value of state.
- `result.subscribe`: Subscribe to value changes.
- `result.set`: Set the value of the atom.
- `result.didInit`: State of the atom's middleware initialization process.
  Will be a promise if the initialization is pending and `true` if finished.

### Usage Examples

```ts
// Create an atom
const myAtom = atom({ defaultValue: "my-value" });
const myAtom = atom<string | null>({ defaultValue: null });
const myAtom = atom({
  defaultValue: "my-value",
  name: "custom-name",
  middleware: [localStorage(), reduxDevtools()],
});

// Use an atom
myAtom.set("next-value");
myAtom.set((previous) => previous + "next");
const currentValue = myAtom.get();
myAtom.subscribe((value) => console.log(value));
```

## select

Creates a value, selected from any stateful value.

### API

Parameters:

- `parent` The parent element to select a value from. The internal state must be an object.
- `path` The path to the value you want to select.

Returns: A select instance.

- `result.get`: Read the value of state.
- `result.subscribe`: Subscribe to value changes.
- `result.didInit`: State of the dependents middleware initialization processes.
  Will be a promise if the initialization is pending and `true` if finished.

### Usage Examples

```ts
const myAtom = atom({ defaultValue: { nested: { value: 0 } } });
// Create a selector
const value = select(myAtom, "nested.value");

// Use a selector
const currentValue = value.get();
value.subscribe((value) => console.log(value));
```

## derive

Creates a value, derived from one or more atoms or other derived values.

### API

Parameters:

- `getter` Function to derive a new value from other stateful elements.
- `setter` Function to elevate a new value to it's stateful dependents.

Returns: A derived instance.

- `result.get`: Read the value of state.
- `result.set`: Set the value of the derived atom. (only available if a setter was passed)
- `result.subscribe`: Subscribe to value changes.
- `result.didInit`: State of the dependents middleware initialization processes.
  Will be a promise if the initialization is pending and `true` if finished.

### Usage Examples

With a getter:

```ts
const myAtom = atom({ defaultValue: 1 });
// Create a derivation
const multiplier = derive(({ get }) => get(myAtom) * 2);
const nested = derive(({ get }) => get(multiplier) + get(myAtom));

// Use a derivation
const currentValue = multiplier.get();
multiplier.subscribe((value) => console.log(value));
```

With a getter and setter:

```ts
const post = atom({
  defaultValue: {
    title: "About ducks...",
    content: "They are pretty cute, don't you think?",
    views: 41,
  },
});
// Create a derive atom
const views = derive(
  ({ get }) => get(video).views,
  ({ value, set }) => set(video, { ...video.get(), views: value })
);
// Set value of the derive atom
views.set(42);
// -> post.get().views will be 42
```

## middleware

Create middlewares to be used in combination with a atoms.

Middlewares can be used to interact with an atom by using the following lifecycle actions:

- `init`: Action to be called when the atom is created, but before subscribing to `set` events.
  May return a promise that can be awaited by using `atom.didInit`.
- `didInit`: Action to be called when the atom is created, but after subscribing to `set` events.
  May return a promise that can be awaited by using `atom.didInit`.
- `set`: Action to be called when the atom's `set` function is called.

### API

Parameters:

- `setup`: Middleware actions or function to create middleware actions. Middleware actions are fired in the atom lifecycle, alongside to the subscriptions.

Returns: A middleware function to be used in atoms.

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

## CONFIG

Global configuration object to change internal behavior of yaasl.

Values should be set once in your application entrypoint, before yaasl is being used.

### API

Parameters:

- `name`: Global name to make internal keys unique among UIs on the same domain.
  (e.g. local storage keys look like this if a name is set: "{config-name}/{atom-name}")

### Usage Examples

```ts
CONFIG.name = "my-app-name";
```
