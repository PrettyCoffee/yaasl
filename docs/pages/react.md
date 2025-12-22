# React

Hooks to use all kinds of atoms in an React environment.

## useAtom

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
  const value = useAtom(myAtom);
  return <span>value is {value}</span>;
};
```

#### **selector**

```tsx
const myAtom = createAtom({ defaultValue: { count: 0 } });
const count = createSelector(myAtom, "count");
const MyComponent = () => {
  const value = useAtom(count);
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
  const slice = useAtom(mySlice);
  const count = useAtom(mySlice.selectors.count);

  return <span>count is {count}</span>;
};
```

<!-- tabs:end -->

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
