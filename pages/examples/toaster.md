# Examples - Toaster

In this example, we will create a slice and function to create and render toasts.

The toasts will have a simple data structure:

- `id`: A unique ID among all toasts.
- `kind`: Which kind of feedback this toast provides.
- `message`: The text that should be displayed in the toast.
- `duration` (optional): How long the toast should be displayed before automatically closing.

## Step by step

<!-- tabs:start -->

### **Toast list slice**

To store the toasts, we will use a `slice` instead of an `atom` in this case, since we want to add actions to be able to alter the value.

The `defaultValue` will be `[] as ToastProps[]`. We need to cast this typeto correctly infer the state value type, which will then be used to provide the correct typings for the reducers.

Speaking of `reducers`, we will create two of them:

- `add`: Adds a toast to the state.
- `close`: Closes the toast based on their ID.

[toaster.tsx](./toaster.tsx ":include :type=code :fragment=toastList")

### **showToast**

To be able to show and automatically hide toasts, we will create a function `showToast`, which wraps the `add` action that we created in the slice.

Furthermore, it will provide the ID of the toast and start a timeout to automatically close the toast if a duration is defined.

[toaster.tsx](./toaster.tsx ":include :type=code :fragment=showToast")

See this example on how to use the function in you app:

[toaster.tsx](./toaster.tsx ":include :type=code :fragment=showToastUsage")

### **useToasts**

To use the slice within a react component that renders the toasts, we can create a custom hook that returns the list of all toasts and the close action.

[toaster.tsx](./toaster.tsx ":include :type=code :fragment=useToasts")

See this example on how to use the hook:

[toaster.tsx](./toaster.tsx ":include :type=code :fragment=useToastsUsage")

<!-- tabs:end -->

## Full code

Here is the full code we created in the previous steps.

[toaster.tsx](./toaster.tsx ":include :type=code")
