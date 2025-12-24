const isIterable = (value: object) =>
  Symbol.iterator in value && typeof value[Symbol.iterator] === "function"

const isPureObject = (value: object) => value.constructor === Object

const getType = (value: unknown) => {
  if (typeof value === "object") {
    if (value === null) return "null"
    if (isIterable(value)) return "iterable"
    if (isPureObject(value)) return "pure-object"
    return "class-object"
  }

  if (typeof value === "function") {
    return "function"
  }

  return "primitive"
}

const comparePureObject = (
  a: object,
  b: object,
  compareValue: (a: unknown, b: unknown) => boolean
) => {
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) return false
  return keysA.every(
    key =>
      key in b &&
      compareValue(a[key as keyof typeof a], b[key as keyof typeof b])
  )
}

const compareIterable = (
  a: unknown,
  b: unknown,
  compareValue: (a: unknown, b: unknown) => boolean
): boolean => {
  try {
    const arrA = [...(a as unknown[])]
    const arrB = [...(b as unknown[])]

    if (arrA.length !== arrB.length) return false
    return (
      arrA.length === arrB.length &&
      arrA.every((item, index) => compareValue(item, arrB[index]))
    )
  } catch {
    return false
  }
}

const compareClass = (a: object, b: object): boolean => {
  if (a.constructor !== b.constructor) return false

  if (a.valueOf !== Object.prototype.valueOf) {
    return a.valueOf() === b.valueOf()
  }

  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  if (a.toString() !== Object.prototype.toString()) {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return a.toString() === b.toString()
  }

  return false
}

const hasBeenSeen = (
  a: unknown,
  b: unknown,
  seen: WeakMap<object, WeakSet<object>>
) => {
  if (typeof a !== "object" || typeof b !== "object" || a == null || b == null)
    return false

  const seenPairs = seen.get(a) ?? new WeakSet<object>()
  if (seenPairs.has(b)) return true

  seenPairs.add(b)
  seen.set(a, seenPairs)
  return false
}

export const deepCompare = (
  a: unknown,
  b: unknown,
  seen = new WeakMap<object, WeakSet<object>>()
  // eslint-disable-next-line complexity
): boolean => {
  if (a === b) return true

  const typeA = getType(a)
  const typeB = getType(b)
  if (typeA !== typeB) return false

  if (hasBeenSeen(a, b, seen)) return true

  const compareValue = (a: unknown, b: unknown) => deepCompare(a, b, seen)

  switch (typeA) {
    case "primitive":
    case "null":
      return a === b
    case "function":
      return String(a) === String(b)
    case "iterable":
      return compareIterable(a, b, compareValue)
    case "pure-object":
      return comparePureObject(a as object, b as object, compareValue)
    case "class-object":
      return compareClass(a as object, b as object)
  }
}
