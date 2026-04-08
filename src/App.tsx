import { startTransition, useState } from 'react'

import { FinalScreen } from './components/FinalScreen'
import { GameScreen } from './components/GameScreen'
import { StartScreen } from './components/StartScreen'
import { createRouteBlueprint } from './game/pathGenerator'
import type { GameResult, RouteBlueprint, ScreenState } from './types/game'

function App() {
  const [screenState, setScreenState] = useState<ScreenState>('start')
  const [currentRound, setCurrentRound] = useState<RouteBlueprint | null>(null)
  const [lastResult, setLastResult] = useState<GameResult | null>(null)

  const startRound = () => {
    const nextRound = createRouteBlueprint()

    startTransition(() => {
      setCurrentRound(nextRound)
      setLastResult(null)
      setScreenState('playing')
    })
  }

  const handleRoundComplete = (result: GameResult) => {
    startTransition(() => {
      setLastResult(result)
      setScreenState('finished')
    })
  }

  return (
    <main className="app-shell">
      <div className="app-shell__background app-shell__background--top" />
      <div className="app-shell__background app-shell__background--bottom" />

      <div className="app-frame">
        {screenState === 'start' && <StartScreen onStart={startRound} />}

        {screenState === 'playing' && currentRound && (
          <GameScreen
            key={currentRound.id}
            round={currentRound}
            onComplete={handleRoundComplete}
          />
        )}

        {screenState === 'finished' && lastResult && (
          <FinalScreen result={lastResult} onPlayAgain={startRound} />
        )}
      </div>
    </main>
  )
}

export default App
