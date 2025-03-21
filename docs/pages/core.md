# Core

## createAtom

Creates an atom store.

### API

Parameters:

- `config.defaultValue`: Value that will be used initially.
- `config.name`: Name of the atom. Must be unique among all atoms. Defaults to "atom-{number}".
- `config.effects`: Effects that will be applied on the atom.

Returns: An atom instance.

- `result.get`: Read the value of state.
- `result.subscribe`: Subscribe to value changes.
- `result.set`: Set the value of the atom.
- `result.didInit`: State of the atom's effects initialization process.
  Will be a promise if the initialization is pending and `true` if finished.
- `result.destroy`: Make this atom unusable and remove all references.

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
- `result.destroy`: Make this atom unusable and remove all references.

### Usage Examples

```ts
const myAtom = createAtom({ defaultValue: { nested: { value: 42 } } });
// Create a path selector
const selected = createSelector(myAtom, "nested.value");

// Use a selector
const currentValue = selected.get();
selected.subscribe((value) => console.log(value));
```

## createSelector (combiner)

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
- `result.destroy`: Make this atom unusable and remove all references.

### Usage Examples

```ts
const atom1 = createAtom({ defaultValue: 2 });
const atom2 = createAtom({ defaultValue: 40 });
// Create a combiner selector
const selected = createSelector(
  [atom1, atom2],
  (value1, value2) => value1 + value2,
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
- `result.destroy`: Make this atom unusable and remove all references.

### Usage Examples

<!-- tabs:start -->

#### **Getter only**

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

#### **Getter + setter**

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
  ({ value, set }) => set(video, { ...video.get(), views: value }),
);
// Set value of the derive atom
views.set(42);
// -> post.get().views will be 42
```

<!-- tabs:end -->

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

## createSlice

Create s slice of state that represents an atom with its own reducers and actions.

### API

Parameters: Accepts the same parameters as `createAtom` and additionally:

- `config.reducers` Reducers for custom actions to set the atom's value.
- `config.selectors` Path or combiner selectors to use the atom's values to create new ones.

Returns: An atom instance with actions and selectors.

### Usage Examples

<!-- tabs:start -->

#### **Primitive value**

```ts
const counter = createSlice({
  defaultValue: 0,
  reducers: {
    increment: (state) => state + 1,
    add: (state, ...values: number[]) => values.reduce((a, b) => a + b, state),
  },
  selectors: {
    double: (state) => state * 2,
  },
});

counter.actions.increment();
counter.get(); // -> 0 + 1 = 1
counter.actions.add(10, 10);
counter.get(); // -> 1 + 10 + 10 = 21
counter.selectors.double.get(); // -> 21 * 2 = 42
```

#### **Object value**

```ts
const article = createSlice({
  defaultValue: {
    title: "About ducks...",
    content: "They are pretty cute, don't you think?",
    metrics: {
      views: 68,
      upvotes: 46,
      downvotes: 4,
    }
  },

  reducers: {
    incrementViews: (state) => ({
      ...state,
      metrics: {
        ...state.metrics,
        views: views: state.metrics.views + 1,
      }
    }),
  },

  selectors: {
    views: "metrics.views",
    voteBalance: ({ metrics }) =>
      metrics.upvotes - metrics.downvotes,
  },
})

article.actions.incrementViews()
article.selectors.views.get() // -> 69
article.selectors.voteBalance.get() // -> 46 - 4 = 42
```

<!-- tabs:end -->

## CONFIG

Global configuration object to change internal behavior of yaasl.

> Note: Values should be set once in your application entrypoint, before yaasl is being used.
> Check out the [Config setup example](/pages/examples/config-setup) for more details on that!

### API

Parameters:

- `name`: Global name to make internal keys unique among UIs on the same domain.
  (e.g. local storage keys look like this if a name is set: "{config-name}/{atom-name}")
- `globalEffects`: Global effects to apply on all atoms. (e.g. reduxDevtools)

### Usage Examples

```ts
CONFIG.name = "my-app-name";
CONFIG.globalEffects = [reduxDevtools({ disable: !import.meta.env.DEV })];
```
