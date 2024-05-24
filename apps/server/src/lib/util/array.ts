// todo: extend the Array interface in a .d.ts file
export const partition = <T>(value: T[], condition: (element: T) => boolean): [T[], T[]] => {
  return value.reduce(
    (acc, e) => {
      if (condition(e)) {
        acc[0].push(e);
      } else {
        acc[1].push(e);
      }
      return acc;
    },
    [new Array<T>(), new Array<T>()],
  );
};
