# React

Hooks to use all kinds of atoms in an React environment.

## useAtomValue

Use an atom's value in the React lifecycle.

### API

Parameters:

- `atom`: Atom to be used.

Returns: The atom's value.

### Usage Examples

<!-- tabs:start -->

#### **atom**

```tsx
const myAtom = createAtom({ defaultValue: 0 });
const MyComponent = () => {
  const value = useAtomValue(myAtom);
  return <span>value is {value}</span>;
};
```

#### **selector**

```tsx
const myAtom = createAtom({ defaultValue: { count: 0 } });
const count = createSelector(myAtom, "count");
const MyComponent = () => {
  const value = useAtomValue(count);
  return <span>value is {value}</span>;
};
```

#### **slice**

```tsx
const mySlice = createSlice({
  defaultValue: { count: 0 },
  selectors: {
    count: "count",
  },
});
const MyComponent = () => {
  const slice = useAtomValue(mySlice);
  const count = useAtomValue(mySlice.selectors.count);

  return <span>count is {count}</span>;
};
```

<!-- tabs:end -->

## useSetAtom

Set an atom's value in the React lifecycle.

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

Use an atom's initialization state in the React lifecycle.

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

Use an atom's value and setter in the React lifecycle.

### API

Parameters:

- `atom`: Atom to be used.

Returns: A state value and state setter for the atom.

- `[0]`: Stateful value of the atom.
- `[1]`: Setter function for the atom. Will throw an error if the atom is not settable (e.g. selectors).
- `[2]`: Boolean that indicates if the atom did finish initializing.

### Usage Examples

<!-- tabs:start -->

#### **atom**

```tsx
const myAtom = createAtom({ defaultValue: 0 });
const MyComponent = () => {
  const [value, setValue] = useAtom(myAtom);

  const onClick = () => setValue((previous) => previous + 1);

  return <button onClick={onClick}>value is {value}</button>;
};
```

#### **derived**

```tsx
const myAtom = createAtom({ defaultValue: 2 });
const double = createDerived(
  ({ get }) => get(myAtom) * 2,
  ({ value, set }) => set(myAtom, value / 2),
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

<!-- tabs:end -->
