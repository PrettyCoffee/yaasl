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

Returns: The middleware to be used on atoms.

### Usage Examples

```ts
const atomWithDevtools = atom({
  defaultValue: "my-value",
  middleware: [reduxDevtools()],
});

const isProduction = import.meta.env.PROD;
const atomWithDevtools = atom({
  defaultValue: "my-value",
  middleware: [reduxDevtools({ disable: isProduction })],
});
```
