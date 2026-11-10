const tints = [
  'var(--elementPeach)',
  'var(--elementPink)',
  'var(--elementBlue)',
  'var(--elementBlueVariant)',
  'var(--elementBlueVariant2)',
  'var(--elementBlueGreenGradient)',
  'var(--elementGreen)',
  'var(--elementGreenVariant)',
  'var(--elementGreenVariant2)',
  'var(--elementLavender)',
  'var(--elementRed)',
  'var(--elementBrown)',
  'var(--elementYellow)',
  'var(--elementBeige)',
  'var(--elementDarkGreen)',
  'var(--elementMetal)',
  'var(--elementEggshell)'
]

export const nameTint = (name: string): string => {
  let hash = 0
  for (let index = 0; index < name.length; index++) {
    hash = (hash * 31 + name.charCodeAt(index)) | 0
  }
  return tints[Math.abs(hash) % tints.length]
}
