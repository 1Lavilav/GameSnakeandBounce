import type { GameResult } from '../types/game'

interface FinalScreenProps {
  result: GameResult
  onPlayAgain: () => void
}

function getResultCopy(result: GameResult): { title: string; description: string } {
  if (result.reason === 'timeout') {
    return {
      title: 'Бегунок дошёл до конца',
      description: 'Нажатия не было, поэтому итоговый результат этого раунда = 0.',
    }
  }

  if (result.score === 0) {
    return {
      title: 'Почти получилось',
      description: 'Остановка была вне призовых диапазонов. В следующем раунде маршрут будет новым.',
    }
  }

  return {
    title: 'Точный стоп',
    description: `Попадание в ${result.score}-очковую зону засчитано по позиции бегунка вдоль маршрута.`,
  }
}

export function FinalScreen({ result, onPlayAgain }: FinalScreenProps) {
  const copy = getResultCopy(result)
  const stopProgressPercent = Math.round(result.stopProgress * 100)

  return (
    <section className="screen screen--final">
      <div className="result-card">
        <p className="eyebrow">Результат раунда</p>
        <div className="result-card__score">{result.score}</div>
        <h2>{copy.title}</h2>
        <p className="lead">{copy.description}</p>

        <div className="result-card__meta">
          <span>Остановка: {stopProgressPercent}% пути</span>
          <span>Попытка: 1 из 1</span>
        </div>

        <button className="primary-button" type="button" onClick={onPlayAgain}>
          Играть снова
        </button>
      </div>
    </section>
  )
}
