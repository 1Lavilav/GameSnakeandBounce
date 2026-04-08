import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { GAME_CONFIG, PRIZE_BANDS, ROUTE_LAYOUT } from '../constants/gameConfig'
import { buildRoutePath } from '../game/pathGenerator'
import { calculateScore } from '../game/scoring'
import type { GameResult, Point, PrizeZone, RouteBlueprint } from '../types/game'
import { normalize } from '../utils/math'
import { useElementSize } from '../utils/useElementSize'
import { RouteSvg } from './RouteSvg'
import type { ZoneDecoration } from './RouteSvg'

interface GameScreenProps {
  round: RouteBlueprint
  onComplete: (result: GameResult) => void
}

export function GameScreen({ round, onComplete }: GameScreenProps) {
  const { ref: boardRef, size } = useElementSize<HTMLDivElement>()
  const pathRef = useRef<SVGPathElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const progressRef = useRef(0)
  const lastTimestampRef = useRef<number | null>(null)
  const hasCompletedRef = useRef(false)

  const [pathLength, setPathLength] = useState(0)
  const [runnerPosition, setRunnerPosition] = useState<Point | null>(null)
  const [zoneDecorations, setZoneDecorations] = useState<ZoneDecoration[]>([])

  const pathData = useMemo(
    () => buildRoutePath(round.anchors, size, ROUTE_LAYOUT),
    [round.anchors, size],
  )

  const completeRound = useCallback((reason: 'stop' | 'timeout') => {
    if (hasCompletedRef.current) {
      return
    }

    hasCompletedRef.current = true

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    const stopProgress = progressRef.current

    if (reason === 'timeout') {
      onComplete({
        score: 0,
        zoneId: null,
        matchedBand: null,
        distance: null,
        stopProgress,
        reason,
      })
      return
    }

    const outcome = calculateScore(stopProgress, round.prizeZones)

    onComplete({
      ...outcome,
      stopProgress,
      reason,
    })
  }, [onComplete, round.prizeZones])

  useEffect(() => {
    const pathElement = pathRef.current

    if (!pathElement || !pathData) {
      return
    }

    const frameId = requestAnimationFrame(() => {
      const nextLength = pathElement.getTotalLength()
      const safeLength = Number.isFinite(nextLength) ? nextLength : 0

      setPathLength(safeLength)

      if (safeLength > 0) {
        const startingPoint = pathElement.getPointAtLength(
          safeLength * progressRef.current,
        )

        setRunnerPosition({ x: startingPoint.x, y: startingPoint.y })
        setZoneDecorations(
          round.prizeZones.map((zone) =>
            createZoneDecoration(pathElement, zone, safeLength, size.width),
          ),
        )
      }
    })

    return () => cancelAnimationFrame(frameId)
  }, [pathData, round.prizeZones, size.height, size.width])

  useEffect(() => {
    if (pathLength <= 0 || hasCompletedRef.current) {
      return
    }

    lastTimestampRef.current = null

    const tick = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp
      }

      const deltaSeconds = (timestamp - lastTimestampRef.current) / 1000
      lastTimestampRef.current = timestamp

      const nextProgress = Math.min(
        progressRef.current +
          (deltaSeconds * GAME_CONFIG.runnerSpeedPxPerSecond) / pathLength,
        1,
      )

      progressRef.current = nextProgress

      const pathElement = pathRef.current

      if (pathElement) {
        const point = pathElement.getPointAtLength(pathLength * nextProgress)
        setRunnerPosition({ x: point.x, y: point.y })
      }

      if (nextProgress >= 1) {
        completeRound('timeout')
        return
      }

      animationFrameRef.current = requestAnimationFrame(tick)
    }

    animationFrameRef.current = requestAnimationFrame(tick)

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [completeRound, pathLength, round.id])

  const handleStop = () => {
    completeRound('stop')
  }

  return (
    <section className="screen screen--game">
      <div className="screen__header">
        <div>
          <p className="eyebrow">Раунд запущен</p>
          <h1>Останови бегунок внутри одной из подсвеченных зон</h1>
        </div>

        <div className="legend">
          {PRIZE_BANDS.map((band) => (
            <div className="legend__item" key={band.score}>
              <span
                className="legend__dot"
                style={{ backgroundColor: band.color, opacity: band.opacity }}
              />
              <span>{band.score}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="game-board">
        <div className="game-board__meta">
          <span>4 зоны</span>
          <span>1 попытка</span>
          <span>Маршрут уже задан</span>
        </div>

        <div className="route-canvas" ref={boardRef}>
          <RouteSvg
            pathData={pathData}
            pathElementRef={pathRef}
            totalLength={pathLength}
            prizeZones={round.prizeZones}
            width={size.width}
            height={size.height}
            runnerPosition={runnerPosition}
            zoneDecorations={zoneDecorations}
          />
        </div>
      </div>

      <button
        className="stop-button"
        type="button"
        disabled={pathLength <= 0}
        onClick={handleStop}
      >
        Стоп
      </button>
    </section>
  )
}

function createZoneDecoration(
  path: SVGPathElement,
  zone: PrizeZone,
  totalLength: number,
  width: number,
): ZoneDecoration {
  const centerLength = zone.centerProgress * totalLength
  const centerPoint = path.getPointAtLength(centerLength)
  const previousPoint = path.getPointAtLength(Math.max(centerLength - 6, 0))
  const nextPoint = path.getPointAtLength(Math.min(centerLength + 6, totalLength))
  const tangent = normalize({
    x: nextPoint.x - previousPoint.x,
    y: nextPoint.y - previousPoint.y,
  })

  let normal = normalize({ x: -tangent.y, y: tangent.x })
  let x = centerPoint.x + normal.x * GAME_CONFIG.labelOffset

  if (x < 72 || x > width - 72) {
    normal = { x: -normal.x, y: -normal.y }
    x = centerPoint.x + normal.x * GAME_CONFIG.labelOffset
  }

  return {
    id: zone.id,
    x,
    y: centerPoint.y + normal.y * GAME_CONFIG.labelOffset,
  }
}
