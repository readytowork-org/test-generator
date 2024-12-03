import { FC } from "react"

/*
 * @description extract given keys from a object
 * */
function extractKeys<T, K extends keyof T>(object: T, keys?: K[]) {
  if (!keys) {
    return object
  }
  return Object.keys(object as object)
    .filter((key) => keys?.includes(key as K))
    .reduce(
      (previousValue, currentValue) => {
        return {
          ...previousValue,
          // @ts-ignore
          [currentValue]: object[currentValue],
        }
      },
      {} as Pick<T, K>,
    )
}

/*
 * @description This hoc injects hook to a given component
 * */
export function renderChildrenWithHooksHoc<C, RC>(
  Component: FC<C>,
  useHook: (args: any) => C,
  hookProps?: (keyof RC)[],
): FC<RC> {
  return (props) => {
    const hooks = useHook(extractKeys<RC, keyof RC>(props, hookProps))
    // @ts-ignore
    return <Component {...hooks} {...props} />
  }
}
