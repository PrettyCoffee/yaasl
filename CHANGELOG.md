# Changelog

## 0.10.0 (2024-06-09)

### Breaking Changes

- **createAtom:** Remove reducers property

### Features

- **CONFIG:** Add globalEffects for all atoms
- **createSlice:** Allows creating atoms with actions and selectors
- **devtools:** Add logger effect to monitor atom activities
- **effects:** Rewrite effect dispatcher for more consistent data flow

### Bug Fixes

- **core:** Add missing exports

## 0.9.2 (2024-05-26)

### Misc

- Improve jsdocs

## 0.9.1 (2024-05-26)

### Bug Fixes

- **createAtom:** Use correct types for reducers

## 0.9.0 (2024-05-26)

### Breaking Changes

- **createAtom:** Rename atom to createAtom
- **createDerived:** Rename derive to createDerived
- **createEffect:** Rename middleware to createEffect
- **createSelector:** Rename select to createSelector

### Features

- **atom:** Add reducers option to create actions
- **createActions:** Add createActions helper
- **createSelector:** Add combiner selectors

## 0.8.0 (2024-05-16)

### Breaking Changes

- **atom:** Remove promise unwrapping
- **preact:** Remove useDerive hooks
- **react:** Remove useDerive hooks

### Features

- **core:** Add didInit to all atom types
- **core:** Pass previous value when subscribing to atom or derive
- **select:** Create atom selector helper
- **derive:** Add derive setter functions
- **middleware:** Allow providing atom value types
- **preact:** Add hooks to use settable derive atoms
- **preact:** Allow any atom type in useAtom
- **react:** Add hooks to use settable derive atoms
- **react:** Allow any atom type in useAtom

## 0.7.0 (2024-02-11)

### Breaking Changes

- Restructure project as monorepo

### Features

- **middleware:** Allow waiting for promises returned by init and didInit
- **middleware:** Execute all setups before calling init action
- **preact:** Add preact bindings
- **react:** Add didInit state to useAtom hook

## 0.6.1 (2024-01-23)

### Bug Fixes

- **devtools:** Only warn once when extension was not found

## 0.6.0 (2024-01-20)

### Features

- **middleware:** Add didInit actions
- **migration:** Create migration middleware

## 0.5.0 (2023-10-13)

### Features

- **expiration:** Extract expiration middleware from localStorage
- **indexedDb:** Add indexedDb middleware

## 0.4.0 (2023-09-07)

### Features

- **localStorage:** Add option for custom parsers

## 0.3.0 (2023-09-06)

### Features

- **atom:** Add method to unwrap promises

## 0.2.0 (2023-09-05)

### Features

- Improve package exports
- **localStorage:** Add expiration options

## 0.1.0 (2023-07-11)

- Initial release 🎉
