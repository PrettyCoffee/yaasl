# Middleware

<!-- >> TOC >> -->

- [Middleware](#middleware)
  - [localStorage](#localstorage) [ [API](#api), [Usage Examples](#usage-examples) ]
  - [indexedDb](#indexeddb) [ [API](#api-1), [Usage Examples](#usage-examples-1) ]
  - [expiration](#expiration) [ [API](#api-2), [Usage Examples](#usage-examples-2) ]
  - [migration](#migration) [ [API](#api-3), [Usage Examples](#usage-examples-3) ]
  <!-- << TOC << -->

## localStorage

Middleware to save and load atom values to the local storage.

### API

Parameters:

- `options.key`: Use your own key for the local storage. Will be "{config-name}/{atom-name}" by default.
- `options.noTabSync`: Disable the synchronization of values over browser tabs.
- `options.stringify`: Custom function to stringify a value. Defaults to JSON.stringify. Use this when handling complex datatypes like Maps or Sets.
- `options.parse`: Custom function to parse a string from the store. Defaults to JSON.parse. Use this when handling complex datatypes like Maps or Sets.

Returns: The middleware to be used on atoms.

### Usage Examples

```ts
const atomWithStorage = atom({
  defaultValue: "my-value",
  middleware: [localStorage()],
})

const atomWithStorage = atom({
  defaultValue: "my-value",
  middleware: [localStorage({ key: "my-key" })],
})

const isMapEntry = (value: unknown): value is [unknown, unknown] =>
  Array.isArray(value) && value.length === 2

const mapParser: LocalStorageParser<Map<unknown, unknown>> = {
  parse: text => {
    const value: unknown = JSON.parse(text)
    if (!Array.isArray(value) || !value.every(isMapEntry))
      throw new Error("LocalStorage value is not a valid Map object")

    return new Map(value)
  },
  stringify: value => JSON.stringify(Array.from(value.entries())),
}

const mapAtom = atom({
  defaultValue: new Map<string, string>()
  middleware: [localStorage({ parser: mapParser })],
})
```

## indexedDb

Middleware to save and load atom values to the local storage.

Will use one database and store for all atoms with your `CONFIG.name`
as name or `yaasl` if not set.

### API

Parameters:

- `options.key`: Use your own store key. Will be `atom.name` by default.

Returns: The middleware to be used on atoms.

### Usage Examples

```ts
const atomWithDb = atom({
  defaultValue: "my-value",
  middleware: [indexedDb()],
});

const atomWithDb = atom({
  defaultValue: "my-value",
  middleware: [indexedDb({ key: "my-key" })],
});
```

## expiration

Middleware to make an atom value expirable and reset to its defaulValue.

**Note:** When using `expiresAt`, a function returning the date should be prefered since using a static date might end in an infinite loop.

### API

Parameters:

- `options.expiresAt`: Date at which the value expires
- `options.expiresIn`: Milliseconds in which the value expires. Will be ignored if expiresAt is set.

Returns: The middleware to be used on atoms.

### Usage Examples

```ts
const tomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
};

const expiringAtom = atom({
  defaultValue: "my-value",
  middleware: [expiration({ expiresAt: tomorrow })],
});

const expiringAtom = atom({
  defaultValue: "my-value",
  middleware: [expiration({ expiresIn: 5000 })],
});
```

## migration

Middleware to migrate the persisted value of an atom to a newer version.
You can use the `createMigrationStep` helper to create migration steps.

### API

Parameters:

- `options.steps`: An array of migration steps to migrate an old value

  **Note:** One step must have a `previous` version set to null as entry point.

Returns: The middleware to be used on atoms.

### Usage Examples

#### Creating a migration step

Lets imagine a situation where you created a persisted atom with two names: `name1` and `name2`.
After a while you notice that you would want to have a string array instead for that.

You would now like to convert the localStorage data of users to the new array.

```ts
/** The old datatype */
interface NamesV1 {
  name1: string;
  name2: string;
}

/** Migration step from the old data type to a string array */
const v1 = createMigrationStep({
  previous: null,
  version: "v1",
  migrate: (data: NamesV1) => [data.name1, data.name2],
  validate: (data): data is NamesV1 =>
    data != null &&
    typeof data === "object" &&
    "name1" in data &&
    "name2" in data,
});

/** Using the migration middleware with the created step */
const nameAtom = atom<string[]>({
  defaultValue: [],
  middleware: [localStorage(), migration({ steps: [v1] })],
});
```

#### Multiple migration steps

Lets assume that you now furthermore want to assign a color to each name.
For that, you may need to adapt the data structure of the array items like this:

```ts
interface ColoredName {
  name: string;
  color?: string;
}
```

To achieve this, you can add a second migration step to the steps array of the `migration` middleware:

```ts
interface NamesV1 { ... }

const v1 = createMigrationStep({
  previous: null,
  version: "v1",
  ...
})

type NamesV2 = string[]

const v2 = createMigrationStep({
  previous: "v1",
  version: "v2",
  migrate: (data: NamesV2) => data.map(name => ({ name })),
  validate: (data): data is NamesV2 =>
    Array.isArray(data) && data.every(item => typeof item === "string"),
})

const nameAtom = atom<ColoredName[]>({
  defaultValue: [],
  middleware: [localStorage(), migration({ steps: [v1, v2] })],
})
```
