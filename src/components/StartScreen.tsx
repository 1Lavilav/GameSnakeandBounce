interface StartScreenProps {
  onStart: () => void
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <section className="screen screen--start">
      <div className="hero-card">
        <p className="eyebrow">Мини-игра</p>
        <h1>Поймай прокойны</h1>
        <p className="lead">
          Бегунок один раз проходит по случайному маршруту. Останови его в
          подсвеченной зоне и забери 100, 200 или 300 очков.
        </p>

        <div className="hero-card__facts">
          <span>4 призовые зоны</span>
          <span>1 попытка</span>
          <span>Новый маршрут каждый раунд</span>
        </div>

        <button className="primary-button" type="button" onClick={onStart}>
          Начать игру
        </button>
      </div>
    </section>
  )
}
