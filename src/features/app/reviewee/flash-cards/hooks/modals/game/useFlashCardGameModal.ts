import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { advanceFlashCardSession } from "@/features/app/reviewee/flash-cards/actions/game/advance-flash-card-session.action";
import { revealFlashCardAnswer } from "@/features/app/reviewee/flash-cards/actions/game/reveal-flash-card-answer.action";
import { submitFlashCardAnswer } from "@/features/app/reviewee/flash-cards/actions/game/submit-flash-card-answer.action";
import { timeoutFlashCard } from "@/features/app/reviewee/flash-cards/actions/game/timeout-flash-card.action";
import type {
  FlashCardAnswerReveal,
  FlashCardSummary,
  FlashCardTiming,
  PreparedFlashCardSession,
} from "@/features/app/reviewee/flash-cards/types/flashCardGame";
import { useQuizModalAccessibility } from "@/features/app/reviewee/mcq-quiz/hooks/modals/useQuizModalAccessibility";
import { useGameSounds } from "@/hooks/useGameSounds";

export type FlashCardGamePhase =
  | "answering"
  | "checking"
  | "result"
  | "timeoutHold"
  | "transitioning";

type UseFlashCardGameModalOptions = {
  initialTiming: FlashCardTiming | null;
  isOpen: boolean;
  onFinished: (summary: FlashCardSummary) => void;
  preparedSession: PreparedFlashCardSession | null;
};

const CARD_FADE_DURATION_MS = 300;

const wait = (durationMs: number) =>
  new Promise((resolve) => setTimeout(resolve, durationMs));

const requestFlashCardSessionExitOnPageHide = (sessionId: string) => {
  const body = JSON.stringify({ sessionId });
  const endpoint = "/api/reviewee/flash-cards/exit-session";
  const blob = new Blob([body], { type: "application/json" });

  if (navigator.sendBeacon?.(endpoint, blob)) return;

  void fetch(endpoint, {
    body,
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    method: "POST",
  });
};

export const useFlashCardGameModal = ({
  initialTiming,
  isOpen,
  onFinished,
  preparedSession,
}: UseFlashCardGameModalOptions) => {
  const answerInputRef = useRef<HTMLTextAreaElement>(null);
  const answerDeadlineRef = useRef(0);
  const answerServerStartedAtRef = useRef(0);
  const answerStartedAtRef = useRef(0);
  const phaseDeadlineRef = useRef(0);
  const operationIdRef = useRef(0);
  const isActionInProgressRef = useRef(false);
  const isSessionActiveRef = useRef(false);
  const isTimingReadyRef = useRef(false);
  const lastPlayedCriticalTimerRef = useRef("");
  const timeoutRecordedRef = useRef(false);
  const [currentTiming, setCurrentTiming] =
    useState<FlashCardTiming | null>(null);
  const [phase, setPhase] = useState<FlashCardGamePhase>("answering");
  const [remainingSeconds, setRemainingSeconds] = useState(
    preparedSession?.timerSeconds ?? 0,
  );
  const [answer, setAnswer] = useState("");
  const [answerReveal, setAnswerReveal] =
    useState<FlashCardAnswerReveal | null>(null);
  const [error, setError] = useState("");
  const [isExitConfirmationOpen, setIsExitConfirmationOpen] = useState(false);
  const [isFlashCardVisible, setIsFlashCardVisible] = useState(true);
  const [retryVersion, setRetryVersion] = useState(0);
  const {
    playCorrectAnswerCue,
    playCountdownCue,
    playWrongAnswerCue,
    prepareCountdownCue,
  } = useGameSounds();

  const handleRequestClose = useCallback(() => {
    if (isExitConfirmationOpen) return;
    setIsExitConfirmationOpen(true);
  }, [isExitConfirmationOpen]);

  const modalAccessibility = useQuizModalAccessibility({
    isFocusTrapSuspended: isExitConfirmationOpen,
    isOpen,
    onClose: handleRequestClose,
  });

  const currentFlashCard = useMemo(() => {
    if (!preparedSession || !currentTiming) return null;

    return (
      preparedSession.flashCards.find(
        (flashCard) => flashCard.cardOrder === currentTiming.cardOrder,
      ) ?? null
    );
  }, [currentTiming, preparedSession]);

  const applyTiming = useCallback(
    (timing: FlashCardTiming) => {
      const serverNow = Date.parse(timing.serverNow);
      const serverDeadline = Date.parse(timing.deadlineAt);
      const answerDurationMs = Math.max(0, serverDeadline - serverNow);
      const startedAt = performance.now();
      answerServerStartedAtRef.current = serverNow;
      answerStartedAtRef.current = startedAt;
      answerDeadlineRef.current = startedAt + answerDurationMs;
      phaseDeadlineRef.current = 0;
      timeoutRecordedRef.current = false;
      prepareCountdownCue();
      isTimingReadyRef.current = true;
      setCurrentTiming(timing);
      setRemainingSeconds(preparedSession?.timerSeconds ?? 0);
      setAnswer("");
      setAnswerReveal(null);
      setError("");
      setPhase("answering");
    },
    [prepareCountdownCue, preparedSession?.timerSeconds],
  );

  useEffect(() => {
    if (!isOpen || !initialTiming) return;

    operationIdRef.current += 1;
    isSessionActiveRef.current = true;
    const activeOperationId = operationIdRef.current;
    void Promise.resolve().then(() => {
      if (
        !isSessionActiveRef.current ||
        operationIdRef.current !== activeOperationId
      ) {
        return;
      }

      applyTiming(initialTiming);
      setIsExitConfirmationOpen(false);
      setIsFlashCardVisible(true);
    });

    return () => {
      operationIdRef.current += 1;
      isSessionActiveRef.current = false;
      isTimingReadyRef.current = false;
      isActionInProgressRef.current = false;
    };
  }, [applyTiming, initialTiming, isOpen]);

  useEffect(() => {
    if (!isOpen || !preparedSession) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isSessionActiveRef.current) return;

      event.preventDefault();
      event.returnValue = "";
    };

    const handlePageHide = () => {
      if (!isSessionActiveRef.current) return;

      requestFlashCardSessionExitOnPageHide(preparedSession.sessionId);
      isSessionActiveRef.current = false;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [isOpen, preparedSession]);

  useEffect(() => {
    if (
      !isOpen ||
      phase !== "answering" ||
      !currentTiming ||
      remainingSeconds < 1 ||
      remainingSeconds > 3
    ) {
      return;
    }

    const criticalTimerKey = `${currentTiming.sessionFlashCardId}:${remainingSeconds}`;
    if (lastPlayedCriticalTimerRef.current === criticalTimerKey) return;

    lastPlayedCriticalTimerRef.current = criticalTimerKey;
    playCountdownCue();
  }, [
    currentTiming,
    isOpen,
    phase,
    playCountdownCue,
    remainingSeconds,
  ]);

  const advanceToNextFlashCard = useCallback(
    async (fallbackPhase: "result" | "timeoutHold") => {
      if (
        !preparedSession ||
        !isSessionActiveRef.current ||
        isActionInProgressRef.current
      ) {
        return;
      }

      isActionInProgressRef.current = true;
      setError("");
      setPhase("transitioning");
      setIsFlashCardVisible(false);
      const activeOperationId = operationIdRef.current;

      await wait(CARD_FADE_DURATION_MS);
      if (
        !isSessionActiveRef.current ||
        operationIdRef.current !== activeOperationId
      ) {
        return;
      }

      const result = await advanceFlashCardSession({
        sessionId: preparedSession.sessionId,
      });

      if (
        !isSessionActiveRef.current ||
        operationIdRef.current !== activeOperationId
      ) {
        return;
      }

      if (!result.success || !result.advancement) {
        setError(result.error ?? "Unable to load the next flash card.");
        setPhase(fallbackPhase);
        phaseDeadlineRef.current = Number.POSITIVE_INFINITY;
        setIsFlashCardVisible(true);
        isActionInProgressRef.current = false;
        return;
      }

      if (result.advancement.completed) {
        if (result.advancement.summary) {
          setIsExitConfirmationOpen(false);
          onFinished(result.advancement.summary);
        } else {
          setError("The game ended without a summary.");
          setPhase(fallbackPhase);
          setIsFlashCardVisible(true);
        }
        isActionInProgressRef.current = false;
        return;
      }

      if (!result.advancement.timing) {
        setError("Unable to load the next flash card.");
        setPhase(fallbackPhase);
        setIsFlashCardVisible(true);
        isActionInProgressRef.current = false;
        return;
      }

      applyTiming(result.advancement.timing);
      requestAnimationFrame(() => setIsFlashCardVisible(true));
      isActionInProgressRef.current = false;
    },
    [applyTiming, onFinished, preparedSession],
  );

  const resolveSubmittedAnswer = useCallback(async () => {
    if (
      !currentTiming ||
      !isSessionActiveRef.current ||
      isActionInProgressRef.current
    ) {
      return;
    }

    isActionInProgressRef.current = true;
    setError("");
    const activeOperationId = operationIdRef.current;
    const result = await revealFlashCardAnswer({
      sessionFlashCardId: currentTiming.sessionFlashCardId,
    });

    if (
      !isSessionActiveRef.current ||
      operationIdRef.current !== activeOperationId
    ) {
      return;
    }

    if (!result.success || !result.answer) {
      setError(result.error ?? "Unable to check your answer.");
      phaseDeadlineRef.current = Number.POSITIVE_INFINITY;
      isActionInProgressRef.current = false;
      return;
    }

    if (result.answer.isCorrect) {
      playCorrectAnswerCue();
    } else {
      playWrongAnswerCue();
    }

    setAnswerReveal(result.answer);
    setPhase("result");
    phaseDeadlineRef.current = performance.now() + 3000;
    isActionInProgressRef.current = false;
  }, [
    currentTiming,
    playCorrectAnswerCue,
    playWrongAnswerCue,
  ]);

  const resolveTimedOutFlashCard = useCallback(async () => {
    if (
      !currentTiming ||
      !isSessionActiveRef.current ||
      isActionInProgressRef.current
    ) {
      return;
    }

    if (timeoutRecordedRef.current) {
      await advanceToNextFlashCard("timeoutHold");
      return;
    }

    isActionInProgressRef.current = true;
    setError("");
    const activeOperationId = operationIdRef.current;
    const result = await timeoutFlashCard({
      sessionFlashCardId: currentTiming.sessionFlashCardId,
    });

    if (
      !isSessionActiveRef.current ||
      operationIdRef.current !== activeOperationId
    ) {
      return;
    }

    if (!result.success || !result.timeout) {
      setError(result.error ?? "Unable to record the timed-out flash card.");
      phaseDeadlineRef.current = Number.POSITIVE_INFINITY;
      isActionInProgressRef.current = false;
      return;
    }

    timeoutRecordedRef.current = true;
    isActionInProgressRef.current = false;
    await advanceToNextFlashCard("timeoutHold");
  }, [advanceToNextFlashCard, currentTiming]);

  useEffect(() => {
    if (
      !isOpen ||
      !isSessionActiveRef.current ||
      !isTimingReadyRef.current ||
      !currentTiming ||
      phase === "transitioning"
    ) {
      return;
    }

    const updatePhase = () => {
      const now = performance.now();

      if (phase === "answering") {
        const secondsUntilDeadline = Math.max(
          0,
          Math.ceil((answerDeadlineRef.current - now) / 1000),
        );
        setRemainingSeconds(secondsUntilDeadline);

        if (secondsUntilDeadline === 0) {
          setPhase("timeoutHold");
          phaseDeadlineRef.current = now + 2000;
        }
        return;
      }

      if (now < phaseDeadlineRef.current) return;

      if (phase === "checking") {
        void resolveSubmittedAnswer();
      } else if (phase === "result") {
        void advanceToNextFlashCard("result");
      } else if (phase === "timeoutHold") {
        void resolveTimedOutFlashCard();
      }
    };

    updatePhase();
    const interval = setInterval(updatePhase, 100);
    return () => clearInterval(interval);
  }, [
    advanceToNextFlashCard,
    currentTiming,
    isOpen,
    phase,
    resolveSubmittedAnswer,
    resolveTimedOutFlashCard,
    retryVersion,
  ]);

  const handleAnswerChange = (value: string) => {
    if (phase !== "answering") return;
    setAnswer(value);
    setError("");
  };

  const handleSubmitAnswer = async () => {
    const submittedAnswer = answer.trim();

    if (
      !currentTiming ||
      !submittedAnswer ||
      phase !== "answering" ||
      isActionInProgressRef.current
    ) {
      return;
    }

    isActionInProgressRef.current = true;
    setError("");
    setPhase("checking");
    const clientSubmittedAt = new Date(
      answerServerStartedAtRef.current +
        Math.max(0, performance.now() - answerStartedAtRef.current),
    ).toISOString();
    phaseDeadlineRef.current = performance.now() + 2000;
    const activeOperationId = operationIdRef.current;
    const result = await submitFlashCardAnswer({
      answer: submittedAnswer,
      sessionFlashCardId: currentTiming.sessionFlashCardId,
      submittedAt: clientSubmittedAt,
    });

    if (
      !isSessionActiveRef.current ||
      operationIdRef.current !== activeOperationId
    ) {
      return;
    }

    if (!result.success || !result.submission) {
      setError(result.error ?? "Unable to submit your answer.");
      setPhase("answering");
      isActionInProgressRef.current = false;
      return;
    }

    isActionInProgressRef.current = false;
    await resolveSubmittedAnswer();
  };

  const handleOpenExitConfirmation = handleRequestClose;

  const handleCancelExitConfirmation = () => {
    setIsExitConfirmationOpen(false);
  };

  const handleExited = (summary: FlashCardSummary) => {
    isSessionActiveRef.current = false;
    operationIdRef.current += 1;
    isActionInProgressRef.current = false;
    setError("");
    setIsExitConfirmationOpen(false);
    onFinished(summary);
  };

  const handleRetry = () => {
    setError("");

    if (
      phase === "checking" ||
      phase === "result" ||
      phase === "timeoutHold"
    ) {
      phaseDeadlineRef.current = performance.now();
    }

    setRetryVersion((currentVersion) => currentVersion + 1);
  };

  return {
    answer,
    answerInputRef,
    answerReveal,
    currentFlashCard,
    currentTiming,
    error,
    handleAnswerChange,
    handleCancelExitConfirmation,
    handleExited,
    handleOpenExitConfirmation,
    handleRetry,
    handleSubmitAnswer,
    isExitConfirmationOpen,
    isFlashCardVisible,
    modalAccessibility,
    phase,
    remainingSeconds,
  };
};
