# Devtools

## reduxDevtools

Middleware to make use of the [redux devtools](https://github.com/reduxjs/redux-devtools) browser extension.

### API

Parameters:

- `options.disable`: Disables the middleware. Useful for production.

Returns: The effect to be used on atoms.

### Usage Examples

<!-- tabs:start -->

#### **Single atom**

```ts
const isProduction = import.meta.env.PROD;

const atomWithDevtools = createAtom({
  defaultValue: "my-value",
  effects: [reduxDevtools({ disable: isProduction })],
});
```

#### **Globally**

```ts
import { CONFIG } from "@yaasl/core";

const isProduction = import.meta.env.PROD;

CONFIG.globalEffects = [reduxDevtools({ disable: isProduction })];
```

<!-- tabs:end -->
