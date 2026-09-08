import { useCallback, useEffect, useRef, useState } from "react";
import { startPaesQuizSessionAfterCountdown } from "@/features/app/reviewee/mcq-quiz/actions/start-paes-quiz-session-after-countdown.action";
import { startQuizSessionAfterCountdown } from "@/features/app/reviewee/mcq-quiz/actions/start-quiz-session-after-countdown.action";
import { useQuizModalAccessibility } from "@/features/app/reviewee/mcq-quiz/hooks/modals/useQuizModalAccessibility";
import { useGameSounds } from "@/hooks/useGameSounds";
import type {
  PreparedQuizSession,
  QuizQuestionTiming,
  QuizSessionPreview,
} from "@/features/app/reviewee/mcq-quiz/types/quiz";

type UseGameCountdownModalOptions = {
  isOpen: boolean;
  onCancel: () => void;
  onNoQuestions: (message?: string) => void;
  onStarted: (
    session: PreparedQuizSession,
    timing: QuizQuestionTiming,
  ) => void;
  sessionPreview: QuizSessionPreview | null;
};

export const useGameCountdownModal = ({
  isOpen,
  onCancel,
  onNoQuestions,
  onStarted,
  sessionPreview,
}: UseGameCountdownModalOptions) => {
  const actionInProgressRef = useRef(false);
  const cancelledRef = useRef(false);
  const countdownCueSessionRef = useRef<QuizSessionPreview | null>(null);
  const countdownStartCueSessionRef =
    useRef<QuizSessionPreview | null>(null);
  const lastCountdownCueRef = useRef<number | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");
  const {
    areSoundsReady,
    playCountdownCue,
    playCountdownStartCue,
  } = useGameSounds();
  const modalAccessibility = useQuizModalAccessibility({
    isOpen,
  });

  const beginStart = useCallback(async () => {
    if (
      !sessionPreview ||
      cancelledRef.current ||
      actionInProgressRef.current
    ) {
      return;
    }

    actionInProgressRef.current = true;
    setError("");
    setIsStarting(true);
    const result =
      sessionPreview.gameType === "PAES"
        ? await startPaesQuizSessionAfterCountdown({
            subjectId: sessionPreview.selectionId,
          })
        : await startQuizSessionAfterCountdown({
            areaId: sessionPreview.selectionId,
            difficulty: sessionPreview.difficulty,
            gameType: sessionPreview.gameType,
          });

    if (!result.success) {
      setError(result.error ?? "Unable to start the game.");
      actionInProgressRef.current = false;
      setIsStarting(false);
      return;
    }

    if (
      result.noQuestions ||
      !result.preparedSession ||
      !result.timing
    ) {
      onNoQuestions(
        sessionPreview.gameType === "PAES"
          ? "There are no questions available for this PAES subject yet."
          : undefined,
      );
      return;
    }

    onStarted(result.preparedSession, result.timing);
  }, [onNoQuestions, onStarted, sessionPreview]);

  useEffect(() => {
    if (!isOpen || !sessionPreview || !areSoundsReady) return;

    const countdownStartedAt = Date.now();
    cancelledRef.current = false;
    actionInProgressRef.current = false;
    if (countdownCueSessionRef.current !== sessionPreview) {
      countdownCueSessionRef.current = sessionPreview;
      lastCountdownCueRef.current = 3;
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
        nextCountdown !== lastCountdownCueRef.current
      ) {
        lastCountdownCueRef.current = nextCountdown;
        playCountdownCue();
      }

      setCountdown(nextCountdown);
    }, 100);

    const startTimeout = setTimeout(() => {
      if (
        cancelledRef.current ||
        actionInProgressRef.current ||
        countdownStartCueSessionRef.current === sessionPreview
      ) {
        return;
      }

      countdownStartCueSessionRef.current = sessionPreview;
      setCountdown(0);
      playCountdownStartCue();
      void beginStart();
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(startTimeout);
    };
  }, [
    areSoundsReady,
    beginStart,
    isOpen,
    playCountdownCue,
    playCountdownStartCue,
    sessionPreview,
  ]);

  useEffect(() => {
    if (isOpen) return;

    countdownCueSessionRef.current = null;
    countdownStartCueSessionRef.current = null;
    lastCountdownCueRef.current = null;
  }, [isOpen]);

  const handleCancel = () => {
    if (!sessionPreview || isStarting || actionInProgressRef.current) {
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
