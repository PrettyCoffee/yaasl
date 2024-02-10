# React

<!-- >> TOC >> -->

- [React](#react)
  - [useAtom](#useatom) [ [API](#api), [Usage Examples](#usage-examples) ]
  - [useDerivedValue](#usederivedvalue) [ [API](#api-1), [Usage Examples](#usage-examples-1) ]
  <!-- << TOC << -->

## useAtom

Use an atom's value and setter in the react lifecycle.

**Note:** Use `useAtomValue` or `useSetAtom` to use value or setter separately.

### API

Parameters:

- `atom`: Atom to be used.

Returns: A state value and state setter for the atom.

- `[0]`: Stateful value of the atom.
- `[1]`: Setter function for the atom.
- `[2]`: Boolean that indicates if the atom did finish initializing.

### Usage Examples

```tsx
const myAtom = atom({ defaultValue: 0 });
const MyComponent = () => {
  const [value, setValue] = useAtom(myAtom);

  const onClick = () => setValue((previous) => previous + 1);

  return <button onClick={onClick}>value is {value}</button>;
};
```

## useDerivedValue

Use a derived value in the react lifecycle.

### API

Parameters:

- `derived`: Derived instance to be used.

Returns: A stateful value.

### Usage Examples

```tsx
const myAtom = atom({ defaultValue: 2 });
const double = derive(({ get }) => get(myAtom) * 2);

const MyComponent = () => {
  const [value, setValue] = useAtom(myAtom);
  const doubleValue = useDerivedValue(double);

  const onClick = () => setValue(value + 1);

  return (
    <button onClick={onClick}>
      {value} * 2 = {doubleValue}
    </button>
  );
};
```
