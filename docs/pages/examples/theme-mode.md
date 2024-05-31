# Examples - Theme mode

In this example, we will create atoms and a react hook to save a theme mode with the following options: `dark`, `light` or `system` (the user's operating system preference)

## Step by step

<!-- tabs:start -->

### **System mode**

First, we will create an atom to store the current theme mode of the user's system.

To do that, we need to create an atom that holds the current system mode.
The `getSystemMode` helper is used to read it.

Furthermore, it is required to update the atom's value when the user changes their preference.
We can do so by subscribing to a media matcher and set the state of our atom, when the subscriber is called.

[theme-mode.tsx](./theme-mode.tsx ":include :type=code :fragment=systemMode")

### **Local mode**

Next, we create an atom that stores the mode the user wants to see in our UI locally. For example by using a toggle button.

To also persist this option for the future (after page reloads), we can use the localStorage effect.

[theme-mode.tsx](./theme-mode.tsx ":include :type=code :fragment=localMode")

### **Theme mode**

Now we can combine both of these atoms in a combiner selector to define the mode we want our UI to display (ligh or dark mode).

If the value of the `localMode` atom is `"system"`, we want to use the value of the `systemMode` atom. Otherwise we just return the value of the `localMode` atom.

Furthermore we will toggle a css class `"dark"` on the root html element based off this new state, to be able to use the theme mode in css.

[theme-mode.tsx](./theme-mode.tsx ":include :type=code :fragment=themeMode")

### **useThemeMode**

To use these atoms in react, a custom hook will be very useful.

[theme-mode.tsx](./theme-mode.tsx ":include :type=code :fragment=useThemeMode")

See this example on how to use the hook:

[theme-mode.tsx](./theme-mode.tsx ":include :type=code :fragment=usage")

<!-- tabs:end -->

## Full code

Here is the full code we created in the previous steps.

[theme-mode.tsx](./theme-mode.tsx ":include :type=code")
