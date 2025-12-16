export type Quarter = 1 | 2 | 3 | 4

// turn: 0 -> Q1, 1 -> Q2, 2 -> Q3, 3 -> Q4, 4 -> Q1 ...
export function getQuarter(turn: number): Quarter {
  return ((((turn % 4) + 4) % 4) + 1) as Quarter
}

export function isQuarterEnd(turn: number): boolean {
  return getQuarter(turn) === 4
}

export function isNewYearTurn(turn: number): boolean {
  return turn > 0 && getQuarter(turn) === 1
}

export function formatGameDate(year: number, turn: number): string {
  return `${year} Q${getQuarter(turn)}`
}
