# Motivation

**TL;DR** — Creating stuff is fun, and I dislike the Jotai API.

The first global state library I used in React was Redux, the classic choice.
Over time, multiple other solutions emerged. Among these, Jotai stood out to me the most.
Its atomic state design resonated well with my mental model of state management.

Jotai is really cool, and I love the work of dai-shi generally.

So, why create my own solution? I usually develop small React apps that need some global state, but not a lot.
Often, parts of these apps are connected to a persisted store, such as localStorage or IndexedDB.

With that in mind, Jotai should actually be the perfect solution for me. Right?

Technically, yes. However, I personally disliked the following aspects:

- state is collected in large stores
- missing system for extensibility
- creation of derived atoms

## Stores

An atom in Jotai is not directly a store. Instead, atoms are definitions of what
a piece of the final store will look like. Ultimately, we still have one big store
that holds all stored values.

This concept has one huge upside: Stores are interchangeable, meaning you can create multiple instances.
It's a smart concept that showcases how well-engineered Jotai is!

However, this brings a few downsides, as you will see in the "Extensibility" section.

For example, abstractions will get more complex as you can't only use atoms
standalone but always have to consider that the store is separated.

The trade-offs are making the API more complex for me than it needs to be.

## Extensibility

The API when creating re-usable effects (or middleware) is tedious.
You create a wrapper function that adjusts the atom you pass in there.
This works good for one effect, but when having multiple of them,
it will result in rather unpleasant code.

It looks something like this:

<!-- tabs:start -->

### **One effect**

A classic example is a localStorage effect. It subscribes to the atom and reads from / writes to localStorage.

Such an effect would be used like this:

```ts
const counter = withLocalStorage("counter", atom(0));
```

Manageable, right?

### **Two effects?**

What if I want to add an expiration mechanism to automatically reset the stored value after some time?
We add a new wrapper:

```ts
const DAY = 1000 * 60 * 60 * 24;
const counter = withExpiration(DAY, withLocalStorage("counter", atom(0)));
```

### **More?**

Now, let's imagine some more:

```ts
const DAY = 1000 * 60 * 60 * 24;
const counter = withDebounce(
  100,
  withLogging(
    loggerService,
    withExpiration(DAY, withLocalStorage("counter", atom(0))),
  ),
);
```

I guess you may start to see where I'm coming from. You also can't set the
atom value as a side effect since atoms are _not_ the store but just the
definition of how one piece of the store will look like.

When thinking about it, I'm not even sure if implementing an expiration effect is possible.

### **Potential Solution**

I think directly integrating a side effect system into the atoms would solve this issue.

This is how it could be better when reimagined from my perspective:

```ts
const DAY = 1000 * 60 * 60 * 24;
const counter = atom({
  defaultValue: 0,
  effects: [
    debounce(100),
    logging(loggerService),
    expires(DAY),
    localStorage("counter"),
  ],
});
```

Or at least, that's how I ended up implementing it.
That being said, I get it; it doesn't fit the philosophy of Jotai.
This is just my take on it.

<!-- tabs:end -->

**Note:** Maybe there are better solutions now, or I misunderstood something back then (in 2023).
I didn't dive too deep into Jotai before deciding to create my own solution.

## Derived state

Now, what's the issue with the derived atoms from Jotai? They are pretty flexible, aren't they?

Yes, they are. But as someone coming from redux, I'm already brain-damaged with the pattern established by `reselect`.

Let's compare them:

<!-- tabs:start -->

### **jotai derived atoms**

With Jotai, we create a new atom, read the value from the atoms we need and return a new value:

```ts
const teamAtom = atom([
  { id: 25, name: "Pikachu", level: 32 },
  { id: 94, name: "Gengar", level: 48 },
  { id: 54, name: "Psyduck", level: 16 },
]);
const activePokemon = atom(1);
const activeLevel = atom((get) => {
  const team = get(teamAtom);
  const active = get(activePokemon);
  return team[active].level;
});
```

### **redux reselect**

With reselect, we create selectors, reading

```ts
const getTeam = (state) => state.team;
const getActivePokemon = (state) => state.activePokemon;

const getActiveLevel = createSelector(
  [getTeam, getActivePokemon],
  (team, active) => team[active].level,
);
```

### **reselect in atom land**

When applying this pattern to atoms, it could look like this:

```ts
const teamAtom = atom([
  { id: 25, name: "Pikachu", level: 32 },
  { id: 94, name: "Gengar", level: 48 },
  { id: 54, name: "Psyduck", level: 48 },
]);
const activePokemon = atom(1);

const activeLevel = createSelector(
  [teamAtom, activePokemon],
  (team, active) => team[active].level,
);
```

This may not look like much of a benefit, but I personally found that it
results in a better code structure. Atom dependencies are defined at the
top of your code, making it more transparent for complex combiner functions.

<!-- tabs:end -->

**Important note:** With Jotai's pattern, you can even leverage state changes
from derived atoms up to the underlying atoms by passing a second function to
the atom call. This is not possible when using a createSelector function as shown above!

## Conclusion

These are the key points why I personally didn't want to stay with Jotai.
All of these are just personal preferences and probably made-up reasons to
justify spending days and weeks creating my own state management system.

Is it really a good idea and time-efficient to create your own state management
library when there are hundreds out there? Probably not.

Is it fun creating your own stuff? Hell yeah! 🔥

A nice addition to that is that I learnt a lot while creating this library. (and still am!)
