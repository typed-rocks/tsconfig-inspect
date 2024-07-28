export function clearUndefined(obj: any) {
  Object.entries(obj).forEach(([key, value]) => {
    if (value === undefined) {
      delete obj[key];
    }
  })
}
