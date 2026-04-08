import type { PathLayout, ZoneBandConfig } from '../types/game'

export const ROUTE_LAYOUT: PathLayout = {
  top: 84,
  right: 96,
  bottom: 120,
  left: 96,
}

export const GAME_CONFIG = {
  anchorCount: 9,
  prizeZoneCount: 4,
  runnerSpeedPxPerSecond: 300,
  pathStrokeWidth: 18,
  pathGlowWidth: 34,
  runnerRadius: 14,
  labelOffset: 58,
} as const

export const ROUTE_CONFIG = {
  startY: 0.04,
  endY: 0.96,
  minX: 0.2,
  maxX: 0.8,
  maxDeltaX: 0.18,
  minSwing: 0.055,
  tension: 1,
} as const

export const PRIZE_ZONE_WINDOWS = [
  { start: 0.18, end: 0.26 },
  { start: 0.38, end: 0.46 },
  { start: 0.58, end: 0.66 },
  { start: 0.76, end: 0.84 },
] as const

export const PRIZE_BANDS: ZoneBandConfig[] = [
  {
    score: 100,
    halfWidth: 0.045,
    strokeWidth: 32,
    color: '#f59e0b',
    opacity: 0.28,
  },
  {
    score: 200,
    halfWidth: 0.028,
    strokeWidth: 22,
    color: '#fbbf24',
    opacity: 0.75,
  },
  {
    score: 300,
    halfWidth: 0.013,
    strokeWidth: 11,
    color: '#fff3b0',
    opacity: 1,
  },
] as const
