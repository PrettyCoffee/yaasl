# yaasl/react

<!-- >> TOC >> -->

- [yaasl/react](#yaasl/react)
  - [useAtom](#useatom) [ [API](#api), [Usage Examples](#usage-examples) ]
  - [StoreProvider](#storeprovider) [ [API](#api-1), [Usage Examples](#usage-examples-1) ]
  <!-- << TOC << -->

## useAtom

Use an atoms value and setter within the react lifecycle.
Will use the globalStore by default or any store provided by a StoreProvider.

**Note:** Use `useAtomValue` or `useSetAtom` to use value or setter separately.

### API

Parameters:

- `atom`: Atom to be used for the state

Returns: A state value and state setter for the atom

- `[0]`: Stateful value of the atom
- `[1]`: Setter function for the atom

### Usage Examples

```tsx
const myAtom = atom({ defaultValue: 0 });
const MyComponent = () => {
  const [value, setValue] = useAtom(myAtom);
  const onClick = () => setValue(value + 1);
  return <button onClick={onClick}>value is {value}</button>;
};
```

## StoreProvider

Provide a store to atom hooks. (e.g. useAtom)

### API

Props:

- `store`: Store to be provided to yaasl atom hooks

### Usage Examples

```tsx
const myStore = store();
const myAtom = atom({ defaultValue: 0 });

const MyComponent = () => {
  // Will use myStore instead of globalStore when wrapped by the StoreProvider
  const [value, setValue] = useAtom(myAtom);
  const onClick = () => setValue(value + 1);
  // Or: setValue(previous => previous + 1)
  return <button onClick={onClick}>value is {value}</button>;
};

const MyApp = () => (
  <StoreProvider store={myStore}>
    <MyComponent />
  </StoreProvider>
);
```
