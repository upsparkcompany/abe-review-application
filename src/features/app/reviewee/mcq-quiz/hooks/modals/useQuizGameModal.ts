import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { advanceQuizSession } from "@/features/app/reviewee/mcq-quiz/actions/advance-quiz-session.action";
import { revealQuizAnswer } from "@/features/app/reviewee/mcq-quiz/actions/reveal-quiz-answer.action";
import { submitQuizAnswer } from "@/features/app/reviewee/mcq-quiz/actions/submit-quiz-answer.action";
import { timeoutQuizQuestion } from "@/features/app/reviewee/mcq-quiz/actions/timeout-quiz-question.action";
import { useQuizModalAccessibility } from "@/features/app/reviewee/mcq-quiz/hooks/modals/useQuizModalAccessibility";
import { useGameSounds } from "@/hooks/useGameSounds";
import type {
  PreparedQuizSession,
  PreparedQuizOption,
  QuizAnswerReveal,
  QuizQuestionTiming,
  QuizSummary,
} from "@/features/app/reviewee/mcq-quiz/types/quiz";

export type QuizQuestionPhase =
  | "answering"
  | "checking"
  | "result"
  | "timeoutHold"
  | "transitioning";

type UseQuizGameModalOptions = {
  initialTiming: QuizQuestionTiming | null;
  isOpen: boolean;
  onFinished: (summary: QuizSummary) => void;
  preparedSession: PreparedQuizSession | null;
};

const QUESTION_FADE_DURATION_MS = 300;

const wait = (durationMs: number) =>
  new Promise((resolve) => setTimeout(resolve, durationMs));

const shuffleQuizOptions = (options: PreparedQuizOption[]) => {
  const shuffledOptions = [...options];

  for (
    let optionIndex = shuffledOptions.length - 1;
    optionIndex > 0;
    optionIndex -= 1
  ) {
    const randomIndex = Math.floor(Math.random() * (optionIndex + 1));
    [shuffledOptions[optionIndex], shuffledOptions[randomIndex]] = [
      shuffledOptions[randomIndex],
      shuffledOptions[optionIndex],
    ];
  }

  return shuffledOptions;
};

const requestQuizSessionExitOnPageHide = (sessionId: string) => {
  const body = JSON.stringify({ sessionId });
  const endpoint = "/api/reviewee/mcq-quiz/exit-session";
  const blob = new Blob([body], { type: "application/json" });

  if (navigator.sendBeacon?.(endpoint, blob)) return;

  void fetch(endpoint, {
    body,
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    method: "POST",
  });
};

export const useQuizGameModal = ({
  initialTiming,
  isOpen,
  onFinished,
  preparedSession,
}: UseQuizGameModalOptions) => {
  const answerDeadlineRef = useRef(0);
  const answerServerStartedAtRef = useRef(0);
  const answerStartedAtRef = useRef(0);
  const phaseDeadlineRef = useRef(0);
  const operationIdRef = useRef(0);
  const isActionInProgressRef = useRef(false);
  const isSessionActiveRef = useRef(false);
  const isTimingReadyRef = useRef(false);
  const timeoutRecordedRef = useRef(false);
  const lastCriticalCueRef = useRef<number | null>(null);
  const [currentTiming, setCurrentTiming] =
    useState<QuizQuestionTiming | null>(null);
  const [phase, setPhase] = useState<QuizQuestionPhase>("answering");
  const [remainingSeconds, setRemainingSeconds] = useState(
    preparedSession?.timerSeconds ?? 0,
  );
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [randomizedOptions, setRandomizedOptions] = useState<
    PreparedQuizOption[]
  >([]);
  const [answerReveal, setAnswerReveal] = useState<QuizAnswerReveal | null>(
    null,
  );
  const [error, setError] = useState("");
  const [isExitConfirmationOpen, setIsExitConfirmationOpen] = useState(false);
  const [isQuestionVisible, setIsQuestionVisible] = useState(true);
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

  const currentQuestion = useMemo(() => {
    if (!preparedSession || !currentTiming) return null;

    return (
      preparedSession.questions.find(
        (question) =>
          question.questionOrder === currentTiming.questionOrder,
      ) ?? null
    );
  }, [currentTiming, preparedSession]);

  const applyTiming = useCallback(
    (timing: QuizQuestionTiming) => {
      const serverNow = Date.parse(timing.serverNow);
      const serverDeadline = Date.parse(timing.deadlineAt);
      const startedAt = performance.now();
      answerServerStartedAtRef.current = serverNow;
      answerStartedAtRef.current = startedAt;
      answerDeadlineRef.current =
        startedAt + Math.max(0, serverDeadline - serverNow);
      phaseDeadlineRef.current = 0;
      timeoutRecordedRef.current = false;
      lastCriticalCueRef.current = null;
      prepareCountdownCue();
      isTimingReadyRef.current = true;
      const question = preparedSession?.questions.find(
        (sessionQuestion) =>
          sessionQuestion.questionOrder === timing.questionOrder,
      );
      setCurrentTiming(timing);
      setRandomizedOptions(shuffleQuizOptions(question?.options ?? []));
      setRemainingSeconds(preparedSession?.timerSeconds ?? 0);
      setSelectedOptionId(null);
      setAnswerReveal(null);
      setError("");
      setPhase("answering");
    },
    [prepareCountdownCue, preparedSession],
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
      setIsQuestionVisible(true);
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

      requestQuizSessionExitOnPageHide(preparedSession.sessionId);
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
      remainingSeconds < 1 ||
      remainingSeconds > 3 ||
      lastCriticalCueRef.current === remainingSeconds
    ) {
      return;
    }

    lastCriticalCueRef.current = remainingSeconds;
    playCountdownCue();
  }, [isOpen, phase, playCountdownCue, remainingSeconds]);

  const advanceToNextQuestion = useCallback(
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
      setIsQuestionVisible(false);
      const activeOperationId = operationIdRef.current;

      await wait(QUESTION_FADE_DURATION_MS);
      if (
        !isSessionActiveRef.current ||
        operationIdRef.current !== activeOperationId
      ) {
        return;
      }

      const result = await advanceQuizSession({
        sessionId: preparedSession.sessionId,
      });

      if (
        !isSessionActiveRef.current ||
        operationIdRef.current !== activeOperationId
      ) {
        return;
      }

      if (!result.success || !result.advancement) {
        setError(result.error ?? "Unable to load the next question.");
        setPhase(fallbackPhase);
        phaseDeadlineRef.current = Number.POSITIVE_INFINITY;
        setIsQuestionVisible(true);
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
          setIsQuestionVisible(true);
        }
        isActionInProgressRef.current = false;
        return;
      }

      if (!result.advancement.timing) {
        setError("Unable to load the next question.");
        setPhase(fallbackPhase);
        setIsQuestionVisible(true);
        isActionInProgressRef.current = false;
        return;
      }

      applyTiming(result.advancement.timing);
      requestAnimationFrame(() => setIsQuestionVisible(true));
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
    const result = await revealQuizAnswer({
      sessionQuestionId: currentTiming.sessionQuestionId,
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

  const resolveTimedOutQuestion = useCallback(async () => {
    if (
      !currentTiming ||
      !isSessionActiveRef.current ||
      isActionInProgressRef.current
    ) {
      return;
    }

    if (timeoutRecordedRef.current) {
      await advanceToNextQuestion("timeoutHold");
      return;
    }

    isActionInProgressRef.current = true;
    setError("");
    const activeOperationId = operationIdRef.current;
    const result = await timeoutQuizQuestion({
      sessionQuestionId: currentTiming.sessionQuestionId,
    });

    if (
      !isSessionActiveRef.current ||
      operationIdRef.current !== activeOperationId
    ) {
      return;
    }

    if (!result.success || !result.timeout) {
      setError(result.error ?? "Unable to record the timed-out question.");
      phaseDeadlineRef.current = Number.POSITIVE_INFINITY;
      isActionInProgressRef.current = false;
      return;
    }

    timeoutRecordedRef.current = true;
    isActionInProgressRef.current = false;
    await advanceToNextQuestion("timeoutHold");
  }, [advanceToNextQuestion, currentTiming]);

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
        void advanceToNextQuestion("result");
      } else if (phase === "timeoutHold") {
        void resolveTimedOutQuestion();
      }
    };

    updatePhase();
    const interval = setInterval(updatePhase, 100);
    return () => clearInterval(interval);
  }, [
    advanceToNextQuestion,
    currentTiming,
    isOpen,
    phase,
    resolveSubmittedAnswer,
    resolveTimedOutQuestion,
    retryVersion,
  ]);

  const handleSelectOption = (optionId: number) => {
    if (phase !== "answering") return;
    setSelectedOptionId(optionId);
    setError("");
  };

  const handleSubmitAnswer = async () => {
    if (
      !currentTiming ||
      selectedOptionId === null ||
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
    const result = await submitQuizAnswer({
      selectedOptionId,
      sessionQuestionId: currentTiming.sessionQuestionId,
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

  const handleExited = (summary: QuizSummary) => {
    isSessionActiveRef.current = false;
    operationIdRef.current += 1;
    isActionInProgressRef.current = false;
    setError("");
    setIsExitConfirmationOpen(false);
    onFinished(summary);
  };

  const handleRetry = () => {
    setError("");

    if (phase === "checking") {
      phaseDeadlineRef.current = performance.now();
    } else if (phase === "result" || phase === "timeoutHold") {
      phaseDeadlineRef.current = performance.now();
    }

    setRetryVersion((currentVersion) => currentVersion + 1);
  };

  return {
    answerReveal,
    currentQuestion,
    currentTiming,
    error,
    handleCancelExitConfirmation,
    handleExited,
    handleOpenExitConfirmation,
    handleRetry,
    handleSelectOption,
    handleSubmitAnswer,
    isExitConfirmationOpen,
    isQuestionVisible,
    modalAccessibility,
    phase,
    randomizedOptions,
    remainingSeconds,
    selectedOptionId,
  };
};
