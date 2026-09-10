import { useEffect, useRef, useState } from "react";
import { fetchPaesSubjects } from "@/features/app/reviewee/mcq-quiz/actions/fetch-paes-subjects.action";
import { fetchQuizAreas } from "@/features/app/reviewee/mcq-quiz/actions/fetch-quiz-areas.action";
import { previewPaesQuizSession } from "@/features/app/reviewee/mcq-quiz/actions/preview-paes-quiz-session.action";
import { previewQuizSession } from "@/features/app/reviewee/mcq-quiz/actions/preview-quiz-session.action";
import type {
  QuizArea,
  QuizDifficulty,
  QuizGameType,
  QuizSessionPreview,
} from "@/features/app/reviewee/mcq-quiz/types/quiz";
import { useQuizModalAccessibility } from "@/features/app/reviewee/mcq-quiz/hooks/modals/useQuizModalAccessibility";
import type { GameSelectionOptionsCache } from "@/features/app/reviewee/mcq-quiz/hooks/useGameSelectionOptionsCache";

type UseGameSelectionModalOptions = {
  gameType: QuizGameType | null;
  isOpen: boolean;
  selectionOptionsCache: GameSelectionOptionsCache;
  onClose: () => void;
  onNoQuestions: (message?: string) => void;
  onPreviewed: (preview: QuizSessionPreview) => void;
};

const QUIZ_DIFFICULTIES: QuizDifficulty[] = ["Easy", "Medium", "Hard"];

export const useGameSelectionModal = ({
  gameType,
  isOpen,
  selectionOptionsCache,
  onClose,
  onNoQuestions,
  onPreviewed,
}: UseGameSelectionModalOptions) => {
  const requestIdRef = useRef(0);
  const [selectionOptions, setSelectionOptions] = useState<QuizArea[]>([]);
  const [selectionOptionsGameType, setSelectionOptionsGameType] =
    useState<QuizGameType | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("Easy");
  const [isLoadingAreas, setIsLoadingAreas] = useState(true);
  const [isPreparing, setIsPreparing] = useState(false);
  const [error, setError] = useState("");
  const modalAccessibility = useQuizModalAccessibility({
    isOpen,
    onClose: isPreparing ? undefined : onClose,
  });
  const isPaesGame = gameType === "PAES";
  const cachedSelectionOptions = isPaesGame
    ? selectionOptionsCache.getPaesSubjects()
    : selectionOptionsCache.getQuizAreas();
  const activeSelectedOptionId =
    selectionOptionsGameType === gameType
      ? selectedOptionId
      : String(cachedSelectionOptions?.[0]?.id ?? "");

  useEffect(() => {
    if (!isOpen || !gameType) return;

    const activeRequestId = requestIdRef.current + 1;
    requestIdRef.current = activeRequestId;
    void Promise.resolve().then(async () => {
      const cachedOptions = isPaesGame
        ? selectionOptionsCache.getPaesSubjects()
        : selectionOptionsCache.getQuizAreas();

      if (cachedOptions) {
        setSelectionOptions(cachedOptions);
        setSelectionOptionsGameType(gameType);
        setSelectedOptionId((currentOptionId) => {
          const optionStillExists = cachedOptions.some(
            (option) => String(option.id) === currentOptionId,
          );

          return optionStillExists
            ? currentOptionId
            : String(cachedOptions[0]?.id ?? "");
        });
        setIsLoadingAreas(false);
        return;
      }

      setIsLoadingAreas(true);
      setError("");
      const result = isPaesGame
        ? await fetchPaesSubjects()
        : await fetchQuizAreas();

      if (result.success) {
        if ("subjects" in result) {
          selectionOptionsCache.setPaesSubjects(result.subjects);
        } else {
          selectionOptionsCache.setQuizAreas(result.areas);
        }
      }

      if (requestIdRef.current !== activeRequestId) return;

      if (!result.success) {
        setSelectionOptions([]);
        setSelectionOptionsGameType(gameType);
        setSelectedOptionId("");
        setError(
          result.error ??
            `Unable to load ${isPaesGame ? "PAES subjects" : "quiz areas"}.`,
        );
      } else {
        const options = "subjects" in result ? result.subjects : result.areas;
        setSelectionOptions(options);
        setSelectionOptionsGameType(gameType);
        setSelectedOptionId((currentOptionId) => {
          const optionStillExists = options.some(
            (option) => String(option.id) === currentOptionId,
          );

          return optionStillExists
            ? currentOptionId
            : String(options[0]?.id ?? "");
        });
      }

      setIsLoadingAreas(false);
    });

    return () => {
      requestIdRef.current += 1;
    };
  }, [gameType, isOpen, isPaesGame, selectionOptionsCache]);

  useEffect(() => {
    if (isOpen) return;

    const resetTimeout = setTimeout(() => {
      setDifficulty("Easy");
      setError("");
      setIsLoadingAreas(true);
      setIsPreparing(false);
    }, 300);

    return () => clearTimeout(resetTimeout);
  }, [isOpen]);

  const handleClose = () => {
    if (isPreparing) return;
    modalAccessibility.closeWithAnimation(onClose);
  };

  const handleStartNow = async () => {
    if (!gameType || isPreparing) return;

    const selectedId = Number(activeSelectedOptionId);

    if (!Number.isInteger(selectedId) || selectedId <= 0) {
      setError(`Please select ${isPaesGame ? "a PAES subject" : "an area"}.`);
      return;
    }

    setError("");
    setIsPreparing(true);
    const result = isPaesGame
      ? await previewPaesQuizSession({ subjectId: selectedId })
      : await previewQuizSession({
          areaId: selectedId,
          difficulty,
          gameType,
        });

    if (!result.success) {
      setError(result.error ?? "Unable to prepare this game.");
      setIsPreparing(false);
      return;
    }

    if (result.noQuestions || !result.preview) {
      onNoQuestions(
        isPaesGame
          ? "There are no questions available for this PAES subject yet."
          : undefined,
      );
      setIsPreparing(false);
      return;
    }

    onPreviewed(result.preview);
    setIsPreparing(false);
  };

  return {
    difficulty,
    error,
    handleClose,
    handleStartNow,
    isLoadingAreas: isLoadingAreas && !cachedSelectionOptions,
    isPreparing,
    modalAccessibility,
    isPaesGame,
    quizDifficulties: QUIZ_DIFFICULTIES,
    selectedOptionId: activeSelectedOptionId,
    selectionOptions: cachedSelectionOptions ?? selectionOptions,
    setDifficulty,
    setSelectedOptionId,
  };
};
