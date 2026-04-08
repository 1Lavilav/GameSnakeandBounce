import type { RefObject } from 'react'

import { GAME_CONFIG, PRIZE_BANDS } from '../constants/gameConfig'
import type { Point, PrizeZone } from '../types/game'
import { clamp } from '../utils/math'

interface RouteSvgProps {
  pathData: string
  pathElementRef: RefObject<SVGPathElement | null>
  totalLength: number
  prizeZones: PrizeZone[]
  width: number
  height: number
  runnerPosition: Point | null
  zoneDecorations: ZoneDecoration[]
}

export interface ZoneDecoration {
  id: string
  x: number
  y: number
}

export function RouteSvg({
  pathData,
  pathElementRef,
  totalLength,
  prizeZones,
  width,
  height,
  runnerPosition,
  zoneDecorations,
}: RouteSvgProps) {
  if (!pathData || width <= 0 || height <= 0) {
    return <div className="route-canvas__placeholder">Строим маршрут...</div>
  }

  return (
    <svg
      className="route-svg"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Игровой маршрут с призовыми зонами"
    >
      <defs>
        <linearGradient id="route-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#9bd7ff" />
          <stop offset="100%" stopColor="#4d7cff" />
        </linearGradient>
      </defs>

      <path d={pathData} className="route-svg__glow" />
      <path ref={pathElementRef} d={pathData} className="route-svg__track" />

      {totalLength > 0 &&
        prizeZones.map((zone) =>
          PRIZE_BANDS.map((band) => {
            const segmentLength = band.halfWidth * 2 * totalLength
            const segmentStart = clamp(
              zone.centerProgress * totalLength - segmentLength / 2,
              0,
              totalLength - segmentLength,
            )

            return (
              <path
                key={`${zone.id}-${band.score}`}
                d={pathData}
                className="route-svg__zone"
                style={{
                  stroke: band.color,
                  strokeOpacity: band.opacity,
                  strokeWidth: band.strokeWidth,
                  strokeDasharray: `${segmentLength} ${totalLength}`,
                  strokeDashoffset: `${-segmentStart}`,
                }}
              />
            )
          }),
        )}

      {zoneDecorations.map((zone) => (
        <g key={zone.id} className="route-svg__badge">
          <rect x={zone.x - 42} y={zone.y - 14} width={84} height={28} rx={14} />
          <text x={zone.x} y={zone.y + 4}>
            100-300
          </text>
        </g>
      ))}

      {runnerPosition && (
        <g
          className="route-svg__runner"
          transform={`translate(${runnerPosition.x} ${runnerPosition.y})`}
        >
          <circle
            className="route-svg__runner-halo"
            r={GAME_CONFIG.runnerRadius + 10}
          />
          <circle className="route-svg__runner-core" r={GAME_CONFIG.runnerRadius} />
          <circle
            className="route-svg__runner-dot"
            r={GAME_CONFIG.runnerRadius / 2.5}
          />
        </g>
      )}
    </svg>
  )
}
