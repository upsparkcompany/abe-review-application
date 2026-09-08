import { LoaderCircle, Puzzle } from "lucide-react";
import QuizModalShell from "@/features/app/reviewee/mcq-quiz/components/QuizModalShell";
import { useGameCountdownModal } from "@/features/app/reviewee/mcq-quiz/hooks/modals/useGameCountdownModal";
import type {
  PreparedQuizSession,
  QuizQuestionTiming,
  QuizSessionPreview,
} from "@/features/app/reviewee/mcq-quiz/types/quiz";

export type GameCountdownModalProps = {
  isOpen: boolean;
  onCancel: () => void;
  onNoQuestions: (message?: string) => void;
  onStarted: (
    session: PreparedQuizSession,
    timing: QuizQuestionTiming,
  ) => void;
  sessionPreview: QuizSessionPreview | null;
};

export default function GameCountdownModal(props: GameCountdownModalProps) {
  const gameCountdownModal = useGameCountdownModal(props);

  if (!props.sessionPreview) return null;

  return (
    <QuizModalShell
      className="max-w-[560px] overflow-hidden text-center"
      dialogRef={gameCountdownModal.modalAccessibility.dialogRef}
      isOpen={props.isOpen}
      isVisible={gameCountdownModal.modalAccessibility.isVisible}
      labelledBy="game-countdown-title"
    >
      <div className="bg-primary-accent px-6 py-7 text-surface sm:py-8">
        <Puzzle
          aria-hidden="true"
          strokeWidth={1.8}
          className="mx-auto h-14 w-14"
        />
        <h2
          id="game-countdown-title"
          className="mt-3 text-2xl font-semibold"
        >
          MCQ Quiz Game
        </h2>
        <p className="mt-2 text-base font-semibold">
          {props.sessionPreview.areaName}
          {" · "}
          {props.sessionPreview.gameType}
          {props.sessionPreview.difficulty
            ? ` · ${props.sessionPreview.difficulty}`
            : ""}
        </p>
      </div>

      <div className="px-6 py-8 sm:px-10 sm:py-9">
        <p className="text-xl font-semibold text-primary-text">Get Ready!</p>
        <p className="mt-2 text-xl font-semibold text-secondary-text">
          {gameCountdownModal.areSoundsReady
            ? "Game is starting in"
            : "Preparing game sounds"}
        </p>
        <div
          className="my-7 min-h-24 text-8xl font-semibold tabular-nums text-primary-accent transition-opacity duration-300"
          aria-live="assertive"
          aria-atomic="true"
        >
          {!gameCountdownModal.areSoundsReady ? (
            <LoaderCircle className="mx-auto h-14 w-14 animate-spin" />
          ) : gameCountdownModal.countdown > 0 ? (
            gameCountdownModal.countdown
          ) : gameCountdownModal.isStarting ? (
            <LoaderCircle className="mx-auto h-14 w-14 animate-spin" />
          ) : (
            ""
          )}
        </div>

        {gameCountdownModal.error && (
          <p role="alert" className="mb-5 text-sm text-error">
            {gameCountdownModal.error}
          </p>
        )}

        <button
          type="button"
          onClick={gameCountdownModal.handleCancel}
          disabled={gameCountdownModal.isStarting}
          className="flex h-12 w-full cursor-pointer items-center justify-center rounded bg-primary-accent text-base font-semibold text-surface transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {gameCountdownModal.isStarting ? (
            <LoaderCircle className="h-5 w-5 animate-spin" />
          ) : (
            "Cancel Game"
          )}
        </button>
      </div>
    </QuizModalShell>
  );
}
