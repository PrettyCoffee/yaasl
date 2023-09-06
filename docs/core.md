# Core

<!-- >> TOC >> -->

- [Core](#core)
  - [atom](#atom) [ [API](#api), [Usage Examples](#usage-examples) ]
  - [derive](#derive) [ [API](#api-1), [Usage Examples](#usage-examples-1) ]
  - [CONFIG](#config) [ [API](#api-2), [Usage Examples](#usage-examples-2) ]
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
- `result.unwrap`: Resolve the value of a promise and set as atom value.

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
myAtom
  .unwrap(fetch("https://beep-boop-beep.something"))
  .catch((value) => console.error(value));
```

## derive

Creates a value, derived from one or more atoms or other derived values.

### API

Parameters:

- `get`: Function to derive the new value.

Returns: A derived instance.

- `result.get`: Read the value of state.
- `result.subscribe`: Subscribe to value changes.

### Usage Examples

```ts
const myAtom = atom({ defaultValue: 1 });
// Create a derivation
const multiplier = derive(({ get }) => get(myAtom) * 2);
const nested = derive(({ get }) => get(multiplier) + get(myAtom));

// Use a derivation
const currentValue = multiplier.get();
multiplier.subscribe((value) => console.log(value));
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
