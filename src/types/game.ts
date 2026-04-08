export interface Size {
  width: number
  height: number
}

export interface Point {
  x: number
  y: number
}

export interface NormalizedPoint {
  x: number
  y: number
}

export interface PathLayout {
  top: number
  right: number
  bottom: number
  left: number
}

export interface PrizeZone {
  id: string
  centerProgress: number
}

export interface RouteBlueprint {
  id: string
  anchors: NormalizedPoint[]
  prizeZones: PrizeZone[]
}

export type PrizeScore = 0 | 100 | 200 | 300

export type RoundEndReason = 'stop' | 'timeout'

export type ScreenState = 'start' | 'playing' | 'finished'

export interface ZoneBandConfig {
  score: Exclude<PrizeScore, 0>
  halfWidth: number
  strokeWidth: number
  color: string
  opacity: number
}

export interface ScoreOutcome {
  score: PrizeScore
  zoneId: string | null
  matchedBand: Exclude<PrizeScore, 0> | null
  distance: number | null
}

export interface GameResult extends ScoreOutcome {
  stopProgress: number
  reason: RoundEndReason
}
