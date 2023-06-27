# yaasl/core

<!-- >> TOC >> -->

- [yaasl/core](#yaasl/core)
  - [atom](#atom) [ [API](#api), [Usage Examples](#usage-examples) ]
  - [store](#store) [ [API](#api-1), [Usage Examples](#usage-examples-1) ]
  - [globalStore](#globalstore)
  - [CONFIG](#config)
  <!-- << TOC << -->

## atom

Create atoms to be used in combination with a store.

### API

Parameters:

- `config.defaultValue`: Value that will be returned if the atom is not defined in the store
- `config.name`: Name of the atom. Must be unique among all atoms. Defaults to "atom-{number}".
- `config.middleware`: Middleware that will be applied on the atom

Returns: An atom object

- `atom.defaultValue`: Value that will be returned if the atom is not defined in the store
- `atom.toString`: Returns the unique name of the atom
- `atom.middleware`: Middleware that will be applied on the atom

### Usage Examples

```ts
const myAtom = atom({ defaultValue: "my-value" });
const myAtom = atom<string | null>({ defaultValue: null });
const myAtom = atom({
  defaultValue: "my-value",
  name: "custom-name",
  middleware: [localStorage(), reduxDevtools()],
});
```

## store

Create stores to store values of atoms.

### API

Parameters:

- `config.name`: Name of the store. Must be unique among all stores. Defaults to "store-{number}".

Returns: A store object

- `store.toString`: Returns the unique name of the store
- `store.has`: Check if the store has a value for the atom
- `store.init`: Initialize the atom in the store
- `store.get`: Returns the current value of the atom in the store. Defaults to the defaultValue.
- `store.set`: Sets the value of the atom in the store
- `store.remove`: Removes the atoms value and subscriptions from the store
- `store.subscribe`: Subscribes to value changes of the atom and returns a function to unsubscribe from the action
- `store.unsubscribe`: Unsubscribes from value changes

### Usage Examples

```ts
const myStore = store();
const myStore = store({ name: "my-store" });

myStore.init(myAtom);
const currentValue = myStore.get(myAtom);
myStore.set(myAtom, newValue);
myStore.set(myAtom, (previousValue) => previousValue + "new");
myStore.remove(myAtom);

const action = ({ type, value }) => {
  if (type === "SET") {
    console.log(value);
  }
};
const unsubscribe = myStore.subscribe(myAtom, action);
unsubscribe();

myStore.unsubscribe(myAtom, action);
```

## globalStore

Store to be used as default store.

## CONFIG

Global configuration object to change internal behavior of yaasl.

Values should be set once in your application entrypoint, before yaasl is being used.

Parameters:

- `name`: Global name to make internal keys unique among UIs on the same domain.
  (e.g. local storage keys: "{config-name}{store-name}/{atom-name}")
