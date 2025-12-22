import {
  createSelector,
  useAtom,
  localStorage,
  createAtom,
  createActions,
} from "@yaasl/react"

/// [systemMode]
type ThemeMode = "dark" | "light"

const getSystemMode = (): ThemeMode =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"

const systemMode = createAtom<ThemeMode>({
  defaultValue: getSystemMode(),
})

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", ({ matches }) =>
    systemMode.set(matches ? "dark" : "light")
  )
/// [systemMode]

/// [localMode]
type ThemeModeOrSystem = ThemeMode | "system"
const localMode = createAtom<ThemeModeOrSystem>({
  defaultValue: "system",
  effects: [localStorage()],
})

const nextMode = {
  system: "dark",
  dark: "light",
  light: "system",
} as const

const modeActions = createActions(localMode, {
  next: mode => nextMode[mode],
})
/// [localMode]

/// [themeMode]
const themeMode = createSelector(
  [localMode, systemMode],
  (mode, system): ThemeMode => (mode === "system" ? system : mode)
)

themeMode.subscribe(theme =>
  document.documentElement.classList.toggle("dark", theme === "dark")
)
/// [themeMode]

/// [useThemeMode]
export const useThemeMode = () => {
  const theme = useAtom(themeMode)
  const mode = useAtom(localMode)
  return { mode, theme, nextMode: modeActions.next }
}
/// [useThemeMode]

/// [usage]
export const Toggle = () => {
  const { mode, nextMode } = useThemeMode()
  return <button onClick={nextMode}>{mode}</button>
}
/// [usage]
