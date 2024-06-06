export type Updater<State> = State | ((previous: State) => State)

export const updater = <State>(next: Updater<State>, previous: State) =>
  next instanceof Function ? next(previous) : next
