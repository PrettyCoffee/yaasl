# Examples - Config setup

In this example, we will set up a yaasl config and overcome the problem of execution order.

## The problem

You might wonder why exactly we need a guide for this, after all we are just setting some properties on a global object, right?

Well, it turns out that the execution order matters a lot here, since we want to set config properties **before** creating any atoms. But when creating atoms on the file's top level, it is instantly executed when the browser reads the file's content. Meaning we have no control which code is run first.

For example this might happen:

```ts
// a.ts - executes first, uses the default config
import { createAtom } from "@yaasl/core"
export const atomA = createAtom({ ... })

// config.ts - executes after a.ts
import { CONFIG } from "@yaasl/core"
CONFIG.name = "my-app-name"

// z.ts - executes after config.ts, uses the app config
import { createAtom } from "@yaasl/core"
export const atomZ = createAtom({ ... })
```

This will especially be a problem, when using `globalEffects` or effects that that make use of the `CONFIG.name` property.

So how can we change the execution order in our favor?

## The solution

To resolve this, we can re-export the whole library after setting the config properties and import all parts of yaasl from the config file instead.

To ergonomically handle this, I would recommend setting up absolute imports in your project.

For example, create this file:

[config-setup.ts](./config-setup.ts ":include :type=code")

And then import everything from there:

```ts
// a.ts
import { createAtom } from "lib/yaasl.ts"
export const atomA = createAtom({ ... })

// z.ts
import { createAtom } from "lib/yaasl.ts"
export const atomZ = createAtom({ ... })
```

This will ensure that the `yaasl.ts` file runs first.

This is far from ideal if you ask me, but that's all I got. So if you have a better idea, please let me know by creating a github issue! 🙏
