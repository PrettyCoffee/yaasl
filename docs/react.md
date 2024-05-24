# React

<!-- >> TOC >> -->

- [React](#react)
  - [useAtomValue](#useatomvalue) [ [API](#api), [Usage Examples](#usage-examples) ]
  - [useSetAtom](#usesetatom) [ [API](#api-1), [Usage Examples](#usage-examples-1) ]
  - [useAtomDidInit](#useatomdidinit) [ [API](#api-2), [Usage Examples](#usage-examples-2) ]
  - [useAtom](#useatom) [ [API](#api-3), [Usage Examples](#usage-examples-3) ]
  <!-- << TOC << -->

## useAtomValue

Use an atom's value in the react lifecycle.

### API

Parameters:

- `atom`: Atom to be used.

Returns: The atom's value.

### Usage Examples

```tsx
const myAtom = createAtom({ defaultValue: 0 });
const MyComponent = () => {
  const value = useAtomValue(myAtom);
  return <span>value is {value}</span>;
};
```

## useSetAtom

Set an atom's value in the react lifecycle.

### API

Parameters:

- `atom`: Atom to be used.

Returns: A setter function for the atom.

### Usage Examples

```tsx
const myAtom = createAtom({ defaultValue: 0 });
const MyComponent = () => {
  const setValue = useSetAtom(myAtom);

  const onClick = () => setValue((previous) => previous + 1);

  return <button onClick={onClick}>Increment value</button>;
};
```

## useAtomDidInit

Use an atom's initialization state in the react lifecycle.

### API

Parameters:

- `atom`: Atom to be used.

Returns: A boolean indicating if the atom has finished initializing yet.

### Usage Examples

```tsx
const myAtom = createAtom({ defaultValue: 0 });
const MyComponent = () => {
  const didInit = useAtomDidInit(myAtom);
  return <span>{didInit ? "Initialization finished" : "Initializing..."}</span>;
};
```

## useAtom

Use an atom's value and setter in the react lifecycle.

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
const myAtom = createAtom({ defaultValue: 0 });
const MyComponent = () => {
  const [value, setValue] = useAtom(myAtom);

  const onClick = () => setValue((previous) => previous + 1);

  return <button onClick={onClick}>value is {value}</button>;
};
```

With a `select` result:

```tsx
const myAtom = createAtom({ defaultValue: { current: { value: 0 } } });
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
const myAtom = createAtom({ defaultValue: 2 });
const double = createDerived(
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
