import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import type { QuizArea, QuizSubject } from "@/features/app/reviewee/mcq-quiz/types/quiz";

const QUIZ_AREAS_CACHE_KEY = ["reviewee", "mcq-quiz", "quiz-areas"];
const PAES_SUBJECTS_CACHE_KEY = ["reviewee", "mcq-quiz", "paes-subjects"];

export type GameSelectionOptionsCache = {
  getPaesSubjects: () => QuizSubject[] | null;
  getQuizAreas: () => QuizArea[] | null;
  setPaesSubjects: (subjects: QuizSubject[]) => void;
  setQuizAreas: (areas: QuizArea[]) => void;
};

export const useGameSelectionOptionsCache = (): GameSelectionOptionsCache => {
  const queryClient = useQueryClient();

  return useMemo(
    () => ({
      getPaesSubjects: () =>
        queryClient.getQueryData<QuizSubject[]>(PAES_SUBJECTS_CACHE_KEY) ??
        null,
      getQuizAreas: () =>
        queryClient.getQueryData<QuizArea[]>(QUIZ_AREAS_CACHE_KEY) ?? null,
      setPaesSubjects: (subjects) => {
        queryClient.setQueryData(PAES_SUBJECTS_CACHE_KEY, subjects);
      },
      setQuizAreas: (areas) => {
        queryClient.setQueryData(QUIZ_AREAS_CACHE_KEY, areas);
      },
    }),
    [queryClient],
  );
};
