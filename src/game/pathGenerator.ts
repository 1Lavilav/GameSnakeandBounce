import {
  GAME_CONFIG,
  PRIZE_ZONE_WINDOWS,
  ROUTE_CONFIG,
  ROUTE_LAYOUT,
} from '../constants/gameConfig'
import type {
  NormalizedPoint,
  PathLayout,
  Point,
  PrizeZone,
  RouteBlueprint,
  Size,
} from '../types/game'
import { clamp, lerp, randomBetween } from '../utils/math'

export function createRouteBlueprint(): RouteBlueprint {
  return {
    id: crypto.randomUUID(),
    anchors: createAnchors(GAME_CONFIG.anchorCount),
    prizeZones: createPrizeZones(),
  }
}

export function buildRoutePath(
  anchors: NormalizedPoint[],
  size: Size,
  layout: PathLayout = ROUTE_LAYOUT,
): string {
  if (size.width <= 0 || size.height <= 0 || anchors.length < 2) {
    return ''
  }

  const points = anchors.map((anchor) => projectPoint(anchor, size, layout))
  return buildSmoothPath(points)
}

function createAnchors(anchorCount: number): NormalizedPoint[] {
  const anchors: NormalizedPoint[] = []
  let currentX = randomBetween(0.46, 0.54)

  for (let index = 0; index < anchorCount; index += 1) {
    const progress = index / (anchorCount - 1)
    const y = lerp(ROUTE_CONFIG.startY, ROUTE_CONFIG.endY, progress)

    if (index === 0 || index === anchorCount - 1) {
      currentX = clamp(0.5 + randomBetween(-0.05, 0.05), 0.42, 0.58)
    } else {
      const centerPull = (0.5 - currentX) * 0.28
      const drift = randomBetween(-ROUTE_CONFIG.maxDeltaX, ROUTE_CONFIG.maxDeltaX)
      let nextX = clamp(
        currentX + drift + centerPull,
        ROUTE_CONFIG.minX,
        ROUTE_CONFIG.maxX,
      )

      if (Math.abs(nextX - currentX) < ROUTE_CONFIG.minSwing) {
        const direction = drift >= 0 ? 1 : -1
        nextX = clamp(
          currentX + direction * ROUTE_CONFIG.minSwing,
          ROUTE_CONFIG.minX,
          ROUTE_CONFIG.maxX,
        )
      }

      currentX = nextX
    }

    anchors.push({ x: currentX, y })
  }

  return anchors
}

function createPrizeZones(): PrizeZone[] {
  return PRIZE_ZONE_WINDOWS.map((window, index) => ({
    id: `zone-${index + 1}`,
    centerProgress: randomBetween(window.start, window.end),
  }))
}

function projectPoint(
  point: NormalizedPoint,
  size: Size,
  layout: PathLayout,
): Point {
  const innerWidth = Math.max(0, size.width - layout.left - layout.right)
  const innerHeight = Math.max(0, size.height - layout.top - layout.bottom)

  return {
    x: layout.left + point.x * innerWidth,
    y: layout.top + point.y * innerHeight,
  }
}

function buildSmoothPath(points: Point[]): string {
  if (points.length === 0) {
    return ''
  }

  if (points.length === 1) {
    return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`
  }

  const tensionFactor = ROUTE_CONFIG.tension / 6
  let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`

  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = index > 0 ? points[index - 1] : points[index]
    const p1 = points[index]
    const p2 = points[index + 1]
    const p3 = index < points.length - 2 ? points[index + 2] : p2

    const cp1 = {
      x: p1.x + (p2.x - p0.x) * tensionFactor,
      y: p1.y + (p2.y - p0.y) * tensionFactor,
    }
    const cp2 = {
      x: p2.x - (p3.x - p1.x) * tensionFactor,
      y: p2.y - (p3.y - p1.y) * tensionFactor,
    }

    path += ` C ${cp1.x.toFixed(2)} ${cp1.y.toFixed(2)}, ${cp2.x.toFixed(2)} ${cp2.y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }

  return path
}
