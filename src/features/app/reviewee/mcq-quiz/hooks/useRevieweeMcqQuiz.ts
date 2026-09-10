import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchRevieweeMcqQuizPageData } from "@/features/app/reviewee/mcq-quiz/actions/fetch-reviewee-mcq-quiz-page-data.action";
import type {
  PreparedQuizSession,
  QuizGameType,
  QuizQuestionTiming,
  QuizSessionPreview,
  QuizSummary,
} from "@/features/app/reviewee/mcq-quiz/types/quiz";
import { useTodaysTriviaCard } from "@/features/app/reviewee/trivia/hooks/useTodaysTriviaCard";
import { useGameSelectionOptionsCache } from "@/features/app/reviewee/mcq-quiz/hooks/useGameSelectionOptionsCache";

export type RevieweeMcqQuizStage =
  | "idle"
  | "selection"
  | "countdown"
  | "playing"
  | "summary";

const DEFAULT_NO_QUESTIONS_MESSAGE =
  "There are no questions available for this area and difficulty yet.";

export const useRevieweeMcqQuiz = () => {
  const selectionOptionsCache = useGameSelectionOptionsCache();
  const pageDataQuery = useQuery({
    queryKey: ["reviewee", "mcq-quiz", "page-data"],
    queryFn: fetchRevieweeMcqQuizPageData,
    staleTime: 0,
    gcTime: Infinity,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
  const todaysTriviaCard = useTodaysTriviaCard({
    initialTriviaResult:
      pageDataQuery.data?.todaysTrivia ??
      (pageDataQuery.isError
        ? {
            success: false,
            error: "Unable to load today's trivia.",
            trivia: null,
          }
        : undefined),
  });
  const [selectedGameType, setSelectedGameType] =
    useState<QuizGameType | null>(null);
  const [stage, setStage] = useState<RevieweeMcqQuizStage>("idle");
  const [preparedSession, setPreparedSession] =
    useState<PreparedQuizSession | null>(null);
  const [sessionPreview, setSessionPreview] =
    useState<QuizSessionPreview | null>(null);
  const [initialTiming, setInitialTiming] =
    useState<QuizQuestionTiming | null>(null);
  const [summary, setSummary] = useState<QuizSummary | null>(null);
  const [noQuestions, setNoQuestions] = useState({
    isOpen: false,
    message: DEFAULT_NO_QUESTIONS_MESSAGE,
  });

  const resetMcqQuizGame = useCallback(() => {
    setSelectedGameType(null);
    setStage("idle");
    setPreparedSession(null);
    setSessionPreview(null);
    setInitialTiming(null);
    setSummary(null);
    setNoQuestions((currentState) => ({
      ...currentState,
      isOpen: false,
    }));
  }, []);

  const openGameSelection = useCallback((gameType: QuizGameType) => {
    setSelectedGameType(gameType);
    setPreparedSession(null);
    setSessionPreview(null);
    setInitialTiming(null);
    setSummary(null);
    setStage("selection");
  }, []);

  const closeGameSelection = useCallback(() => {
    setSelectedGameType(null);
    setStage("idle");
  }, []);

  const handleSessionPreviewed = useCallback((preview: QuizSessionPreview) => {
    setSessionPreview(preview);
    setStage("countdown");
  }, []);

  const handleNoQuestions = useCallback((message?: string) => {
    setNoQuestions({
      isOpen: true,
      message: message ?? DEFAULT_NO_QUESTIONS_MESSAGE,
    });
  }, []);

  const closeNoQuestions = useCallback(() => {
    setNoQuestions((currentState) => ({
      ...currentState,
      isOpen: false,
    }));
  }, []);

  const handleCountdownCancelled = useCallback(() => {
    resetMcqQuizGame();
  }, [resetMcqQuizGame]);

  const handleCountdownNoQuestions = useCallback((message?: string) => {
    setSelectedGameType(null);
    setSessionPreview(null);
    setStage("idle");
    setNoQuestions({
      isOpen: true,
      message: message ?? DEFAULT_NO_QUESTIONS_MESSAGE,
    });
  }, []);

  const handleGameStarted = useCallback(
    (session: PreparedQuizSession, timing: QuizQuestionTiming) => {
      setPreparedSession(session);
      setInitialTiming(timing);
      setStage("playing");
    },
    [],
  );

  const handleGameFinished = useCallback((gameSummary: QuizSummary) => {
    setSummary(gameSummary);
    setStage("summary");
  }, []);

  return {
    closeGameSelection,
    closeNoQuestions,
    handleCountdownCancelled,
    handleCountdownNoQuestions,
    handleGameFinished,
    handleGameStarted,
    handleNoQuestions,
    handleSessionPreviewed,
    initialTiming,
    isLoadingInitialPageData: pageDataQuery.isPending,
    noQuestions,
    openGameSelection,
    preparedSession,
    resetMcqQuizGame,
    selectedGameType,
    selectionOptionsCache,
    sessionPreview,
    stage,
    summary,
    todaysTriviaCard,
  };
};
