# Devtools

<!-- >> TOC >> -->

- [Devtools](#devtools)
  - [reduxDevtools](#reduxdevtools) [ [API](#api), [Usage Examples](#usage-examples) ]
  <!-- << TOC << -->

## reduxDevtools

Middleware to make use of the [redux devtools](https://github.com/reduxjs/redux-devtools) browser extension.

### API

Parameters:

- `options.disable`: Disables the middleware. Useful for production.

Returns: The effect to be used on atoms.

### Usage Examples

```ts
const atomWithDevtools = createAtom({
  defaultValue: "my-value",
  effects: [reduxDevtools()],
});

const isProduction = import.meta.env.PROD;
const atomWithDevtools = createAtom({
  defaultValue: "my-value",
  effects: [reduxDevtools({ disable: isProduction })],
});
```
