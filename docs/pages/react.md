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
const count = createSelector(myAtom, (state) => state.count);
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

## useSelector

Compute a new value based on the state of an atom.

### API

Parameters:

- `atom`: Atom to be used.
- `selector`: Function to retrieve the new value.
- `compare`: Function to compare the previous with a newer value. Defaults to a custom equality function.

Returns: The computed value.

### Usage Examples

<!-- tabs:start -->

#### **Nested value**

```tsx
const myAtom = createAtom({ defaultValue: { value: 1 } });
const MyComponent = () => {
  const value = useSelector(myAtom, (state) => state.value);
  return <span>value is {value}</span>;
};
```

#### **Computed value**

```tsx
const myAtom = createAtom({ defaultValue: { value: 1 } });
const MyComponent = () => {
  const doubled = useSelector(myAtom, (state) => state.value * 2);
  return <span>value * 2 is {doubled}</span>;
};
```

#### **Custom compare function**

```tsx
import { isEqual } from "lodash";

const myAtom = createAtom({ defaultValue: { value: 1 } });
const MyComponent = () => {
  const value = useSelector(myAtom, (state) => state.value, isEqual);
  return <span>value is {value}</span>;
};
```

<!-- tabs:end -->
