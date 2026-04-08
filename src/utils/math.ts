import type { Point } from '../types/game'

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function lerp(start: number, end: number, progress: number): number {
  return start + (end - start) * progress
}

export function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

export function normalize(point: Point): Point {
  const length = Math.hypot(point.x, point.y)

  if (length === 0) {
    return { x: 0, y: -1 }
  }

  return {
    x: point.x / length,
    y: point.y / length,
  }
}
