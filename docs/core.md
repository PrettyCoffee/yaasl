# Core

<!-- >> TOC >> -->

- [Core](#core)
  - [createAtom](#createatom) [ [API](#api), [Usage Examples](#usage-examples) ]
  - [createSelector (key path)](#createselector-key-path) [ [API](#api-1), [Usage Examples](#usage-examples-1) ]
  - [createSelector (combiner function)](#createselector-combiner-function) [ [API](#api-2), [Usage Examples](#usage-examples-2) ]
  - [createDerived](#createderived) [ [API](#api-3), [Usage Examples](#usage-examples-3) ]
  - [createActions](#createactions) [ [API](#api-4), [Usage Examples](#usage-examples-4) ]
  - [createEffect](#createeffect) [ [API](#api-5), [Usage Examples](#usage-examples-5) ]
  - [CONFIG](#config) [ [API](#api-6), [Usage Examples](#usage-examples-6) ]
  <!-- << TOC << -->

## createAtom

Creates an atom store.

### API

Parameters:

- `config.defaultValue`: Value that will be used initially.
- `config.name`: Name of the atom. Must be unique among all atoms. Defaults to "atom-{number}".
- `config.effects`: Effects that will be applied on the atom.
- `config.reducers`: Reducers for custom actions to set the atom's value.

Returns: An atom instance.

- `result.get`: Read the value of state.
- `result.subscribe`: Subscribe to value changes.
- `result.set`: Set the value of the atom.
- `result.actions`: All actions that were created with reducers.
- `result.didInit`: State of the atom's effects initialization process.
  Will be a promise if the initialization is pending and `true` if finished.

### Usage Examples

```ts
// Create an atom
const myAtom = createAtom({ defaultValue: "my-value" });
const myAtom = createAtom<string | null>({ defaultValue: null });
const myAtom = createAtom({
  defaultValue: "my-value",
  name: "custom-name",
  effects: [localStorage(), reduxDevtools()],
});

// Use an atom
myAtom.set("next-value");
myAtom.set((previous) => previous + "next");
const currentValue = myAtom.get();
myAtom.subscribe((value) => console.log(value));
```

## createSelector (key path)

Creates a value, selected from one atom with an object value by using a key path.

### API

Parameters:

- `atom` The atom to select a value from. The internal state must be an object.
- `path` The path to the value you want to select.

Returns: A PathSelector instance.

- `result.get`: Read the value of state.
- `result.subscribe`: Subscribe to value changes.
- `result.didInit`: State of the atom's effects initialization processes.
  Will be a promise if the initialization is pending and `true` if finished.

### Usage Examples

```ts
const myAtom = createAtom({ defaultValue: { nested: { value: 42 } } });
// Create a path selector
const selected = createSelector(myAtom, "nested.value");

// Use a selector
const currentValue = selected.get();
selected.subscribe((value) => console.log(value));
```

## createSelector (combiner function)

Creates a value, selected from multiple atoms by using a combiner function.

### API

Parameters:

- `atoms` Atoms you need to combine to receive the new value.
- `combiner` Combiner function to use the atom values and create a new value.

Returns: A CombinerSelector instance.

- `result.get`: Read the value of state.
- `result.subscribe`: Subscribe to value changes.
- `result.didInit`: State of the atoms effects initialization processes.
  Will be a promise if the initialization is pending and `true` if finished.

### Usage Examples

```ts
const atom1 = createAtom({ defaultValue: 2 });
const atom2 = createAtom({ defaultValue: 40 });
// Create a combiner selector
const selected = createSelector(
  [atom1, atom2],
  (value1, value2) => value1 + value2
);

// Use a selector
const currentValue = selected.get(); // -> 42
selected.subscribe((value) => console.log(value));
```

## createDerived

Creates a value, derived from one or more atoms or other derived values.

### API

Parameters:

- `getter` Function to derive a new value from other stateful elements.
- `setter` Function to elevate a new value to it's stateful dependents.

Returns: A derived instance.

- `result.get`: Read the value of state.
- `result.set`: Set the value of the derived atom. (only available if a setter was passed)
- `result.subscribe`: Subscribe to value changes.
- `result.didInit`: State of the dependents effects initialization processes.
  Will be a promise if the initialization is pending and `true` if finished.

### Usage Examples

With a getter:

```ts
const atom1 = createAtom({ defaultValue: 2 });
const atom2 = createAtom({ defaultValue: 20 });
// Create a derivation
const twice = createDerived(({ get }) => get(atom2) * 2);
const added = createDerived(({ get }) => get(atom1) + get(twice));

// Use a derivation
const currentValue = added.get(); // -> 2 + (20 * 2) = 42
multiplier.subscribe((value) => console.log(value));
```

With a getter and setter:

```ts
const post = createAtom({
  defaultValue: {
    title: "About ducks...",
    content: "They are pretty cute, don't you think?",
    views: 41,
  },
});
// Create a derive atom
const views = createDerived(
  ({ get }) => get(video).views,
  ({ value, set }) => set(video, { ...video.get(), views: value })
);
// Set value of the derive atom
views.set(42);
// -> post.get().views will be 42
```

## createActions

Create actions to change the state of an atom.

### API

Parameters:

- `atom` Atom to be used.
- `reducers` Reducers for custom actions to set the atoms value.

Returns: Actions to change the state of the atom.

### Usage Examples

```ts
const counter = createAtom({ defaultValue: 0 });
const actions = createActions(counter, {
  increment: (state) => state + 1,
  decrement: (state) => state - 1,
  add: (state, value: number) => state + value,
  subtract: (state, value: number) => state - value,
});
actions.increment();
actions.add(5);
```

## createEffect

Create effects to be used in combination with atoms.

Effects can be used to interact with an atom by using the following lifecycle actions:

- `init`: Action to be called when the atom is created, but before subscribing to `set` events.
  May return a promise that can be awaited by using `atom.didInit`.
- `didInit`: Action to be called when the atom is created, but after subscribing to `set` events.
  May return a promise that can be awaited by using `atom.didInit`.
- `set`: Action to be called when the atom's `set` function is called.

### API

Parameters:

- `setup`: Effect actions or function to create effect actions. Effect actions are fired in the atom lifecycle, alongside to the subscriptions.

Returns: An effect function to be used in atoms.

### Usage Examples

```ts
// Create an effect
const logger = createEffect({
  init: ({ atom }) => console.log(`Initiated atom "${atom.name}"`),
  didInit: ({ atom }) =>
    console.log(`Did finish initialization of atom "${atom.name}"`),
  set: ({ atom, value }) =>
    console.log(`Value of atom "${atom.name}" was set to:`, value),
});

const myAtom = createAtom({
  defaultValue: "my-value",
  effects: [logger()],
});

// Create an effect that has options
interface Options {
  disable?: boolean;
}
const loggerWithOptions = createEffect<Options>(({ options }) => {
  if (options.disable) return {};

  return {
    init: ({ atom }) => console.log(`Initiated atom "${atom.name}"`),
    didInit: ({ atom }) =>
      console.log(`Did finish initialization of atom "${atom.name}"`),
    set: ({ atom, value }) =>
      console.log(`Value of atom "${atom.name}" was set to:`, value),
  };
});

const myAtom = createAtom({
  defaultValue: "my-value",
  effects: [loggerWithOptions({ disable: true })],
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
