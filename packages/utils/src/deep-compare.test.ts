import { describe, it, expect } from "vitest"

import { deepCompare } from "./deep-compare"

class ClassA {
  value = "a"
  getValue() {
    return this.value
  }
}

class ClassB {
  value = "b"
  getValue() {
    return this.value
  }
}

class ClassWithValue {
  constructor(public value: number) {}
  valueOf() {
    return this.value
  }
}

class ClassWithString {
  constructor(public value: string) {}
  toString() {
    return this.value
  }
}

const createMap = (items: unknown[]) => {
  const map = new Map<unknown, unknown>()
  items.forEach((value, index) => map.set({ key: "key" + index }, { value }))
  return map
}

const createBigObject = () => {
  const primitives = {
    string: "string",
    number: 42,
    undefined: undefined,
    null: null,
  }
  const iterable = [...Object.values(primitives), { ...primitives }]
  const object = {
    primitives: { ...primitives },
    iterable: {
      array: structuredClone(iterable),
      set: new Set(structuredClone(iterable)),
      map: new Map(
        structuredClone(iterable).map(item => [item, item] as const)
      ),
    },
  }
  return Object.assign(object, { nested: { ...object, deeper: object } })
}

describe("Test deepCompare", () => {
  it.each`
    type                               | value                               | match                               | diff
    ${"number"}                        | ${1}                                | ${1}                                | ${2}
    ${"string"}                        | ${"a"}                              | ${"a"}                              | ${"b"}
    ${"null"}                          | ${null}                             | ${null}                             | ${undefined}
    ${"function"}                      | ${() => "a"}                        | ${() => "a"}                        | ${() => "b"}
    ${"function (class)"}              | ${ClassA}                           | ${ClassA}                           | ${ClassB}
    ${"function (builtin class)"}      | ${Date}                             | ${Date}                             | ${Error}
    ${"object"}                        | ${{ value: "a" }}                   | ${{ value: "a" }}                   | ${{ value: "b" }}
    ${"Set object"}                    | ${new Set(["a", { value: "a" }])}   | ${new Set(["a", { value: "a" }])}   | ${new Set(["a", { value: "b" }])}
    ${"Map object"}                    | ${createMap(["a", { value: "a" }])} | ${createMap(["a", { value: "a" }])} | ${createMap(["a", { value: "b" }])}
    ${"Date object"}                   | ${new Date("2025")}                 | ${new Date("2025")}                 | ${new Date("2026")}
    ${"Error object"}                  | ${new Error("error")}               | ${new Error("error")}               | ${new Error("other error")}
    ${"class object (with .valueOf)"}  | ${new ClassWithValue(1)}            | ${new ClassWithValue(1)}            | ${new ClassWithValue(2)}
    ${"class object (with .toString)"} | ${new ClassWithString("a")}         | ${new ClassWithString("a")}         | ${new ClassWithString("b")}
  `("handles $type values", ({ value, match, diff }) => {
    expect(deepCompare(value, match)).toBe(true)
    expect(deepCompare(value, diff)).toBe(false)
  })

  it.each`
    name              | create
    ${"custom class"} | ${() => new ClassA()}
  `("cannot handle $name instances", ({ create }) => {
    expect(deepCompare(create(), create())).toBe(false)
  })

  it("handles cyclic objects", () => {
    const objectA = { value: "a" }
    Object.assign(objectA, { cycle: { deep: objectA } })

    const objectA2 = { value: "a" }
    Object.assign(objectA2, { cycle: { deep: objectA2 } })

    const objectB = { value: "b" }
    Object.assign(objectB, { cycle: { deep: objectB } })

    expect(deepCompare(objectA, objectA2)).toBe(true)
    expect(deepCompare(objectA, objectB)).toBe(false)
  })

  it("handles a positive smoke test", () => {
    expect(deepCompare(createBigObject(), createBigObject())).toBe(true)
  })

  it("handles a negative smoke test", () => {
    const objectA = createBigObject()
    objectA.primitives.string = "other string"
    expect(deepCompare(objectA, createBigObject())).toBe(false)

    const objectB = createBigObject()
    objectB.iterable.set = new Set([1, 2, 3])
    expect(deepCompare(objectB, createBigObject())).toBe(false)

    const objectC = createBigObject()
    objectC.nested.deeper = objectB
    expect(deepCompare(objectC, createBigObject())).toBe(false)
  })
})
