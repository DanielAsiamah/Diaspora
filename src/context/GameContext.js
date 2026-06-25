import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { HEART_REGEN_MS, MAX_HEARTS } from '../theme';

const GameContext = createContext(null);

function applyHeartRegeneration(hearts, nextHeartAt, now = Date.now()) {
  if (hearts >= MAX_HEARTS) {
    return { hearts: MAX_HEARTS, nextHeartAt: null };
  }

  if (!nextHeartAt) {
    return { hearts, nextHeartAt: now + HEART_REGEN_MS };
  }

  if (now < nextHeartAt) {
    return { hearts, nextHeartAt };
  }

  const heartsToRestore = Math.floor((now - nextHeartAt) / HEART_REGEN_MS) + 1;
  const regeneratedHearts = Math.min(MAX_HEARTS, hearts + heartsToRestore);
  const regeneratedNextHeartAt = regeneratedHearts >= MAX_HEARTS
    ? null
    : nextHeartAt + heartsToRestore * HEART_REGEN_MS;

  return {
    hearts: regeneratedHearts,
    nextHeartAt: regeneratedNextHeartAt,
  };
}

export function GameProvider({ children, profileHearts, profileNextHeartAt, onHeartsSync }) {
  const [hearts, setHearts] = useState(profileHearts ?? MAX_HEARTS);
  const [nextHeartAt, setNextHeartAt] = useState(profileNextHeartAt ?? null);
  const [now, setNow] = useState(Date.now());
  const [showOutOfHearts, setShowOutOfHearts] = useState(false);

  useEffect(() => {
    const baseHearts = profileHearts ?? MAX_HEARTS;
    const baseNextHeartAt = profileNextHeartAt ?? null;
    const regenerated = applyHeartRegeneration(baseHearts, baseNextHeartAt);

    setHearts(regenerated.hearts);
    setNextHeartAt(regenerated.nextHeartAt);

    if (
      profileHearts != null &&
      (regenerated.hearts !== baseHearts || regenerated.nextHeartAt !== baseNextHeartAt)
    ) {
      onHeartsSync?.({
        hearts: regenerated.hearts,
        nextHeartAt: regenerated.nextHeartAt,
      });
    }
  }, [profileHearts, profileNextHeartAt, onHeartsSync]);

  useEffect(() => {
    const timer = setInterval(() => {
      const currentNow = Date.now();
      setNow(currentNow);

      setHearts((currentHearts) => {
        const regenerated = applyHeartRegeneration(currentHearts, nextHeartAt, currentNow);
        if (regenerated.hearts !== currentHearts || regenerated.nextHeartAt !== nextHeartAt) {
          setNextHeartAt(regenerated.nextHeartAt);
          onHeartsSync?.({
            hearts: regenerated.hearts,
            nextHeartAt: regenerated.nextHeartAt,
          });
        }
        return regenerated.hearts;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [nextHeartAt, onHeartsSync]);

  const value = useMemo(
    () => ({
      hearts,
      maxHearts: MAX_HEARTS,
      hasHearts: hearts > 0,
      nextHeartAt,
      timeUntilNextHeartMs: hearts >= MAX_HEARTS || !nextHeartAt
        ? 0
        : Math.max(nextHeartAt - now, 0),
      showOutOfHearts,
      loseHeart() {
        setHearts((current) => {
          const next = Math.max(current - 1, 0);
          const nextTimer = next >= MAX_HEARTS
            ? null
            : current === MAX_HEARTS || !nextHeartAt
              ? Date.now() + HEART_REGEN_MS
              : nextHeartAt;

          setNextHeartAt(nextTimer);
          onHeartsSync?.({
            hearts: next,
            nextHeartAt: nextTimer,
          });

          if (next === 0) {
            setShowOutOfHearts(true);
          }

          return next;
        });
      },
      refillHearts() {
        setHearts(MAX_HEARTS);
        setNextHeartAt(null);
        onHeartsSync?.({
          hearts: MAX_HEARTS,
          nextHeartAt: null,
        });
        setShowOutOfHearts(false);
      },
      closeOutOfHearts() {
        setShowOutOfHearts(false);
      },
    }),
    [hearts, nextHeartAt, now, showOutOfHearts, onHeartsSync]
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
