# Effects

<!-- >> TOC >> -->

- [Effects](#effects)
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
- `options.parser`: Custom functions to stringify and parse values. Defaults to JSON.stringify and JSON.parse. Use this when handling complex datatypes like Maps or Sets.

Returns: The effect to be used on atoms.

### Usage Examples

```ts
const atomWithStorage = createAtom({
  defaultValue: "my-value",
  effects: [localStorage()],
})

const atomWithStorage = createAtom({
  defaultValue: "my-value",
  effects: [localStorage({ key: "my-key" })],
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

const mapAtom = createAtom({
  defaultValue: new Map<string, string>()
  effects: [localStorage({ parser: mapParser })],
})
```

## indexedDb

Middleware to save and load atom values to an indexedDb.

Will use one database and store for all atoms with your `CONFIG.name` as name or `yaasl` if not set.

### API

Parameters:

- `options.key`: Use your own store key. Will be `atom.name` by default.

Returns: The effect to be used on atoms.

### Usage Examples

```ts
const atomWithDb = createAtom({
  defaultValue: "my-value",
  effects: [indexedDb()],
});

const atomWithDb = createAtom({
  defaultValue: "my-value",
  effects: [indexedDb({ key: "my-key" })],
});
```

## expiration

Effect to make an atom value expirable and reset to its defaulValue.

**Note:** When using `expiresAt`, a function returning the date should be prefered since using a static date might end in an infinite loop.

### API

Parameters:

- `options.expiresAt`: Date at which the value expires
- `options.expiresIn`: Milliseconds in which the value expires. Will be ignored if expiresAt is set.

Returns: The effect to be used on atoms.

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

const expiringAtom = createAtom({
  defaultValue: "my-value",
  effects: [expiration({ expiresAt: tomorrow })],
});

const expiringAtom = createAtom({
  defaultValue: "my-value",
  effects: [expiration({ expiresIn: 5000 })],
});
```

## migration

Effect to migrate the persisted value of an atom to a newer version.
You can use the `createMigrationStep` helper to create migration steps.

### API

Parameters:

- `options.steps`: An array of migration steps to perform for outdated values.

  **Note:** One step must have a `previous` version set to null as entry point.

Returns: The effect to be used on atoms.

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

/** Using the migration effect with the created step */
const nameAtom = createAtom<string[]>({
  defaultValue: [],
  effects: [localStorage(), migration({ steps: [v1] })],
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

To achieve this, you can add a second migration step to the steps array of the `migration` effects:

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

const nameAtom = createAtom<ColoredName[]>({
  defaultValue: [],
  effects: [localStorage(), migration({ steps: [v1, v2] })],
})
```
