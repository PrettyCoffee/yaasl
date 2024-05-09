import { Stateful } from "./Stateful"

type Selectable = Record<string | number, unknown>

type DeepKeys<T> = T extends object
  ? {
      [K in keyof T]: `${Exclude<K, symbol>}${"" | `.${DeepKeys<T[K]>}`}`
    }[keyof T]
  : never

type DeepValue<T, Path> = T extends Record<string | number, unknown>
  ? Path extends `${infer Current}.${infer Next}`
    ? DeepValue<T[Current], Next>
    : T[Path & string]
  : never

const selectValue = <State extends Selectable, Value>(
  state: State,
  path: DeepKeys<State>
) =>
  path
    .split(".")
    .reduce<unknown>(
      (result, key) => (result as Record<string, unknown>)[key],
      state
    ) as Value

export class Select<
  Path extends DeepKeys<State>,
  State extends Selectable
> extends Stateful<DeepValue<State, Path>> {
  constructor(
    protected readonly parent: Stateful<State>,
    protected readonly path: Path
  ) {
    super(selectValue(parent.get(), path))
    parent.subscribe(state => this.update(selectValue(state, path)))
  }
}

/** Creates a value, selected from any stateful value.
 *
 *  @param parent The parent element to select a value from. The internal state must be an object.
 *  @param path The path to the value you want to select.
 *
 *  @returns A select instance.
 **/
export const select = <Path extends DeepKeys<State>, State extends Selectable>(
  parent: Stateful<State>,
  path: Path
) => new Select(parent, path)
