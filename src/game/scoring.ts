import { PRIZE_BANDS } from '../constants/gameConfig'
import type { PrizeZone, ScoreOutcome } from '../types/game'

const SCORE_PRIORITY = [...PRIZE_BANDS].sort(
  (left, right) => right.score - left.score,
)

export function calculateScore(
  progress: number,
  prizeZones: PrizeZone[],
): ScoreOutcome {
  let bestOutcome: ScoreOutcome = {
    score: 0,
    zoneId: null,
    matchedBand: null,
    distance: null,
  }

  for (const zone of prizeZones) {
    const distance = Math.abs(progress - zone.centerProgress)

    for (const band of SCORE_PRIORITY) {
      if (distance > band.halfWidth) {
        continue
      }

      const isBetterScore = band.score > bestOutcome.score
      const isCloserOnSameScore =
        band.score === bestOutcome.score &&
        (bestOutcome.distance === null || distance < bestOutcome.distance)

      if (isBetterScore || isCloserOnSameScore) {
        bestOutcome = {
          score: band.score,
          zoneId: zone.id,
          matchedBand: band.score,
          distance,
        }
      }

      break
    }
  }

  return bestOutcome
}
