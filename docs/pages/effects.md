# Effects

## createEffect

Create effects (e.g. middleware) to be used in combination with atoms.

Effects can be used to interact with an atom by using the following lifecycle actions:

- `init`: Action to be called when the atom is created.
  May return a promise that can be awaited by using `atom.didInit`.
- `didInit`: Action to be called after the init phase.
  May return a promise that can be awaited by using `atom.didInit`.
- `set`: Action to be called when the atom's value is set.

### API

Parameters:

- `setup`: Effect actions or function to create effect actions.
  Effect actions are fired in the atom lifecycle, alongside to the subscriptions.\
  Additionally, you can pass a `sort` option, which will enforce a position of the
  effect in the execution order.

Returns: An effect function to be used in atoms.

Parameters of effect actions:

- `options`: Options passed to the effect
- `value`: Current value of the atom
- `set`: Function to set the value of the atom
- `atom`: The atom which the effect is applied on

?> Using `atom.set` within an effect may cause unintended behavior, such as recursive calls and inconsistencies. Use the provided `set` function instead.

### Usage Examples

<!-- tabs:start -->

#### **Simple**

```ts
const logger = createEffect({
  init: ({ atom }) => console.log(`Initiated atom "${atom.name}"`),
  didInit: ({ atom }) =>
    console.log(`Did finish initialization of atom "${atom.name}"`),
  set: ({ atom, value }) =>
    console.log(`Value of atom "${atom.name}" was set to:`, value),
});

const myAtom = createAtom({
  defaultValue: "my-value",
  effects: [logger()],
});
```

#### **With options**

```ts
interface Options {
  disable?: boolean;
}
const loggerWithOptions = createEffect<Options>(({ options }) => {
  if (options.disable) return {};

  return {
    init: ({ atom }) => console.log(`Initiated atom "${atom.name}"`),
    didInit: ({ atom }) =>
      console.log(`Did finish initialization of atom "${atom.name}"`),
    set: ({ atom, value }) =>
      console.log(`Value of atom "${atom.name}" was set to:`, value),
  };
});

const myAtom = createAtom({
  defaultValue: "my-value",
  effects: [loggerWithOptions({ disable: true })],
});
```

#### **Set value in effect**

```ts
interface ClampOptions {
  min?: number;
  max?: number;
}
const clamp = createEffect<ClampOptions, number>(({ options }) => {
  const { min = -Infinity, max = Infinity } = options;
  const canClamp = (value: number) => {
    const isNumber = typeof value === "number";
    const isInRange = value >= min && value <= max;
    return isNumber && !isInRange;
  };
  const clampValue = (value: number) => {
    return Math.min(max, Math.max(value, min));
  };

  return {
    init: ({ value, set }) => {
      if (!canClamp(value)) return;
      set(clampValue(value));
    },
    set: ({ value, set }) => {
      if (!canClamp(value)) return;
      set(clampValue(value));
    },
  };
});
```

<!-- tabs:end -->

## autoSort

Middleware to automatically sort the atom value.
Only supports arrays and nullish values.

### API

Parameters:

- `options.sortFn`: Function to sort the atom value.

Returns: The effect to be used on atoms.

### Usage Examples

```ts
const sortFn = (a: string, b: string) => a.localeCompare(b);

const sortedAtom = createAtom({
  defaultValue: ["c", "d", "b"],
  effects: [autoSort({ sortFn })],
});

// sortedAtom.get() -> ["b", "c", "d"]

sortedAtom.set((state) => [...state, "a"]);

// sortedAtom.get() -> ["a", "b", "c", "d"]
```

## localStorage

Middleware to save and load atom values to the local storage.

### API

Parameters:

- `options.key`: Use your own key for the local storage. Will be "{config-name}/{atom-name}" by default.
- `options.noTabSync`: Disable the synchronization of values over browser tabs.
- `options.parser`: Custom functions to stringify and parse values. Defaults to JSON.stringify and JSON.parse. Use this when handling complex datatypes like Maps or Sets.

Returns: The effect to be used on atoms.

### Usage Examples

<!-- tabs:start -->

#### **Basic usage**

```ts
const atomWithStorage = createAtom({
  defaultValue: "my-value",
  effects: [localStorage()],
});

const atomWithStorage = createAtom({
  defaultValue: "my-value",
  effects: [localStorage({ key: "my-key" })],
});
```

#### **Custom parser**

```ts
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

<!-- tabs:end -->

## sessionStorage

Middleware to save and load atom values to the session storage.

### API

Parameters:

- `options.key`: Use your own key for the session storage. Will be "{config-name}/{atom-name}" by default.
- `options.parser`: Custom functions to stringify and parse values. Defaults to JSON.stringify and JSON.parse. Use this when handling complex datatypes like Maps or Sets.

Returns: The effect to be used on atoms.

### Usage Examples

```ts
const atomWithStorage = createAtom({
  defaultValue: "my-value",
  effects: [sessionStorage()],
});

const atomWithStorage = createAtom({
  defaultValue: "my-value",
  effects: [sessionStorage({ key: "my-key" })],
});
```

## indexedDb

Middleware to save and load atom values to an indexedDb.

Will use one database and store for all atoms with your `CONFIG.name` as name or `yaasl` if not set.

Should be used in combination with the `sync` effect, to ensure value integrity.

### API

Parameters:

- `options.key`: Use your own store key. Will be `atom.name` by default.

Returns: The effect to be used on atoms.

### Store API

The `indexedDb` effect also exposes multiple helpers to interact with the created indexedDb store bindings:

- `indexedDb.getAllKeys()`: Retreive all keys currently in use
- `indexedDb.get(key)`: Retrieve a stored value
- `indexedDb.delete(key)`: Delete a stored value
- `indexedDb.set(key, value)`: Store a value

?> Avoid using these if possible, as they will not trigger changes inside related atoms! Only use the helpers when needing granular control over the store, e.g. when creating a custom effect.

### Usage Examples

<!-- tabs:start -->

#### **Effect API**

```ts
const atomWithDb = createAtom({
  name: "demo-atom",
  defaultValue: "my-value",
  effects: [indexedDb()],
});

const atomWithDb = createAtom({
  name: "demo-atom",
  defaultValue: "my-value",
  effects: [indexedDb({ key: "my-key" })],
});
```

#### **Store API**

```ts
const demo = async () => {
  const keys = await indexedDb.getAllKeys();
  const value = await indexedDb.get("demo-atom");
  await indexedDb.delete("demo-atom");
  await indexedDb.set("demo-atom", value);
};
```

<!-- tabs:end -->

## sync

Effect to synchronize the atoms value over tabs.

### API

Parameters: None

Returns: The effect to be used on atoms.

### Usage Examples

```ts
const syncedAtom = createAtom({
  defaultValue: 42,
  effects: [sync()],
});
```

## expiration

Effect to make an atom value expirable and reset to its defaulValue.

### API

Parameters:

- `options.expiresAt`: Date at which the value expires. Using a function returning the date should be prefered here, since using a static date might end in an infinite loop.
- `options.expiresIn`: Milliseconds in which the value expires. Will be ignored if expiresAt is set.

Returns: The effect to be used on atoms.

### Usage Examples

<!-- tabs:start -->

#### **Expires in**

```ts
const expiringAtom = createAtom({
  defaultValue: "my-value",
  effects: [expiration({ expiresIn: 5000 })],
});
```

#### **Epires at**

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
```

<!-- tabs:end -->

## migration

Effect to migrate the persisted value of an atom to a newer version.
You can use the `createMigrationStep` helper to create migration steps.

### API

Parameters:

- `options.steps`: An array of migration steps to perform for outdated values.

  !> One step must have a `previous` version set to null as entry point.

Returns: The effect to be used on atoms.

### Usage Examples

<!-- tabs:start -->

#### **Single step**

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

#### **Multiple steps**

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

<!-- tabs:end -->
