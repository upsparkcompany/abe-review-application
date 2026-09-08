import { useCallback, useEffect, useRef, useState } from "react";
import { startFlashCardSessionAfterCountdown } from "@/features/app/reviewee/flash-cards/actions/game/start-flash-card-session-after-countdown.action";
import type {
  FlashCardCountdownDetails,
  FlashCardTiming,
  PreparedFlashCardSession,
} from "@/features/app/reviewee/flash-cards/types/flashCardGame";
import { useQuizModalAccessibility } from "@/features/app/reviewee/mcq-quiz/hooks/modals/useQuizModalAccessibility";
import { useGameSounds } from "@/hooks/useGameSounds";

type UseFlashCardGameCountdownModalOptions = {
  countdownDetails: FlashCardCountdownDetails | null;
  isOpen: boolean;
  onCancel: () => void;
  onNoFlashCards: () => void;
  onStarted: (
    preparedSession: PreparedFlashCardSession,
    timing: FlashCardTiming,
  ) => void;
};

export const useFlashCardGameCountdownModal = ({
  countdownDetails,
  isOpen,
  onCancel,
  onNoFlashCards,
  onStarted,
}: UseFlashCardGameCountdownModalOptions) => {
  const actionInProgressRef = useRef(false);
  const cancelledRef = useRef(false);
  const lastPlayedCountdownRef = useRef<number | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");
  const modalAccessibility = useQuizModalAccessibility({ isOpen });
  const {
    areSoundsReady,
    playCountdownCue,
    playCountdownStartCue,
  } = useGameSounds();

  const beginStart = useCallback(async () => {
    if (
      !countdownDetails ||
      cancelledRef.current ||
      actionInProgressRef.current
    ) {
      return;
    }

    actionInProgressRef.current = true;
    setError("");
    setCountdown(0);
    setIsStarting(true);
    playCountdownStartCue();
    const result = await startFlashCardSessionAfterCountdown({
      areaId: countdownDetails.areaId,
    });

    if (cancelledRef.current) return;

    if (!result.success) {
      setError(result.error ?? "Unable to start the flash card game.");
      actionInProgressRef.current = false;
      setIsStarting(false);
      return;
    }

    if (
      result.noFlashCards ||
      !result.preparedSession ||
      !result.timing
    ) {
      onNoFlashCards();
      return;
    }

    onStarted(result.preparedSession, result.timing);
  }, [
    countdownDetails,
    onNoFlashCards,
    onStarted,
    playCountdownStartCue,
  ]);

  useEffect(() => {
    if (!isOpen || !countdownDetails || !areSoundsReady) return;

    const countdownStartedAt = Date.now();
    cancelledRef.current = false;
    actionInProgressRef.current = false;
    if (lastPlayedCountdownRef.current !== 3) {
      lastPlayedCountdownRef.current = 3;
      playCountdownCue();
    }
    void Promise.resolve().then(() => {
      setCountdown(3);
      setError("");
      setIsStarting(false);
    });

    const interval = setInterval(() => {
      const elapsedSeconds = Math.floor(
        (Date.now() - countdownStartedAt) / 1000,
      );
      const nextCountdown = Math.max(0, 3 - elapsedSeconds);

      if (
        nextCountdown > 0 &&
        nextCountdown !== lastPlayedCountdownRef.current
      ) {
        lastPlayedCountdownRef.current = nextCountdown;
        playCountdownCue();
      }

      setCountdown(nextCountdown);
    }, 100);

    const startTimeout = setTimeout(() => {
      void beginStart();
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(startTimeout);
    };
  }, [
    areSoundsReady,
    beginStart,
    countdownDetails,
    isOpen,
    playCountdownCue,
  ]);

  useEffect(() => {
    if (isOpen) return;

    lastPlayedCountdownRef.current = null;
  }, [isOpen]);

  const handleCancel = () => {
    if (!countdownDetails || isStarting || actionInProgressRef.current) {
      return;
    }

    cancelledRef.current = true;
    onCancel();
  };

  return {
    countdown,
    error,
    handleCancel,
    isStarting,
    areSoundsReady,
    modalAccessibility,
  };
};
