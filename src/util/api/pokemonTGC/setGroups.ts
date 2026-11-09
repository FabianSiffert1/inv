const sideSetIdsOfMainSet: Record<string, string[]> = {
  '30th': ['30th-c'],
  cel25: ['cel25cc'],
  'swsh4.5': ['swsh4.5sv'],
  sm115: ['sma'],
  'swsh12.5': ['swsh12.5gg'],
  swsh9: ['swsh9tg'],
  swsh10: ['swsh10tg'],
  swsh11: ['swsh11tg'],
  swsh12: ['swsh12tg'],
  ex10: ['exu'],
  bw11: ['rc'],
  xy1: ['xya'],
  sv01: ['sve'],
  me01: ['mee']
}

const mainSetIdOfSideSet = new Map(
  Object.entries(sideSetIdsOfMainSet).flatMap(([mainSetId, sideSetIds]) => sideSetIds.map((sideSetId) => [sideSetId, mainSetId]))
)

export const mainSetIdOf = (setId: string): string => mainSetIdOfSideSet.get(setId) ?? setId

export const isSideSet = (setId: string): boolean => mainSetIdOfSideSet.has(setId)

export const setIdsOfGroup = (setId: string): string[] => {
  const mainSetId = mainSetIdOf(setId)
  return [mainSetId, ...(sideSetIdsOfMainSet[mainSetId] ?? [])]
}

export const compareWithinSetGroup = (setIdA: string, setIdB: string): number => {
  if (setIdA == setIdB || mainSetIdOf(setIdA) != mainSetIdOf(setIdB)) {
    return 0
  }
  const groupSetIds = setIdsOfGroup(setIdA)
  return groupSetIds.indexOf(setIdA) - groupSetIds.indexOf(setIdB)
}
