# React

<!-- >> TOC >> -->

- [React](#react)
  - [useAtom](#useatom) [ [API](#api), [Usage Examples](#usage-examples) ]
  <!-- << TOC << -->

## useAtom

Use an atom's value and setter in the react lifecycle.
Can be used with any result of `atom`, `derive` or `select`.

**Note:** Use `useAtomValue` or `useSetAtom` to use value or setter separately.

### API

Parameters:

- `atom`: Atom to be used.

Returns: A state value and state setter for the atom.

- `[0]`: Stateful value of the atom.
- `[1]`: Setter function for the atom.
- `[2]`: Boolean that indicates if the atom did finish initializing.

### Usage Examples

With an `atom` result:

```tsx
const myAtom = atom({ defaultValue: 0 });
const MyComponent = () => {
  const [value, setValue] = useAtom(myAtom);

  const onClick = () => setValue((previous) => previous + 1);

  return <button onClick={onClick}>value is {value}</button>;
};
```

With a `select` result:

```tsx
const myAtom = atom({ defaultValue: { current: { value: 0 } } });
const myAtomValue = select(myAtom, "current.value");
const MyComponent = () => {
  const setState = useSetAtom(myAtom);
  const value = useAtomValue(myAtomValue);

  const onClick = () =>
    setState((prev) => ({ current: { value: prev.current.value + 1 } }));

  return <button onClick={onClick}>value is {value}</button>;
};
```

With a `derive` result:

```tsx
const myAtom = atom({ defaultValue: 2 });
const double = derive(
  ({ get }) => get(myAtom) * 2,
  ({ value, set }) => set(myAtom, value / 2)
);

const MyComponent = () => {
  const value = useAtomValue(myAtom);
  const [doubleValue, setDoubleValue] = useAtom(double);

  const onClick = () => setDoubleValue(doubleValue + 2);

  return (
    <button onClick={onClick}>
      {value} * 2 = {doubleValue}
    </button>
  );
};
```
