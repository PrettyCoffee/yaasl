# Devtools

Atom effects that can be used for debugging.

## logger

Effect that logs all atom activities to the console.

### API

Parameters:

- `options.disable`: Disables the middleware.

Returns: The effect to be used on atoms.

### Usage Examples

<!-- tabs:start -->

#### **Single atom**

```ts
const isProduction = import.meta.env.PROD;

const atom = createAtom({
  defaultValue: "my-value",
  effects: [logger({ disable: isProduction })],
});
```

#### **Globally**

```ts
import { CONFIG, logger } from "@yaasl/core";

const isProduction = import.meta.env.PROD;

CONFIG.globalEffects = [logger({ disable: isProduction })];
```

<!-- tabs:end -->

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
import { CONFIG, reduxDevtools } from "@yaasl/core";

const isProduction = import.meta.env.PROD;

CONFIG.globalEffects = [reduxDevtools({ disable: isProduction })];
```

<!-- tabs:end -->
