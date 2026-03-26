export const getDropdownItems = <T>(enumClass: T) => {
  if (Array.isArray(enumClass)) {
    return enumClass
  }
  const dropdownItems = Object.entries(enumClass)
    .filter(([key]) => {
      const charCode = key.charCodeAt(0)
      // '0': 48; '9': 57
      return charCode < 48 || charCode > 57
    })
    .map(([, value]) => value)
  // console.log(dropdownItems)
  return dropdownItems
}
