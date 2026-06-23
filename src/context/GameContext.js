import { createContext, useContext, useMemo, useState } from 'react';

import { MAX_HEARTS } from '../theme';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [showOutOfHearts, setShowOutOfHearts] = useState(false);

  const value = useMemo(
    () => ({
      hearts,
      maxHearts: MAX_HEARTS,
      hasHearts: hearts > 0,
      showOutOfHearts,
      loseHeart() {
        setHearts((current) => {
          const next = Math.max(current - 1, 0);
          if (next === 0) {
            setShowOutOfHearts(true);
          }
          return next;
        });
      },
      refillHearts() {
        setHearts(MAX_HEARTS);
        setShowOutOfHearts(false);
      },
      closeOutOfHearts() {
        setShowOutOfHearts(false);
      },
    }),
    [hearts, showOutOfHearts]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
