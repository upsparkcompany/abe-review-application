import { LoaderCircle, Puzzle } from "lucide-react";
import { useFlashCardGameCountdownModal } from "@/features/app/reviewee/flash-cards/hooks/modals/game/useFlashCardGameCountdownModal";
import type {
  FlashCardCountdownDetails,
  FlashCardTiming,
  PreparedFlashCardSession,
} from "@/features/app/reviewee/flash-cards/types/flashCardGame";
import QuizModalShell from "@/features/app/reviewee/mcq-quiz/components/QuizModalShell";

export type FlashCardGameCountdownModalProps = {
  countdownDetails: FlashCardCountdownDetails | null;
  isOpen: boolean;
  onCancel: () => void;
  onNoFlashCards: () => void;
  onStarted: (
    preparedSession: PreparedFlashCardSession,
    timing: FlashCardTiming,
  ) => void;
};

export default function FlashCardGameCountdownModal(
  props: FlashCardGameCountdownModalProps,
) {
  const flashCardGameCountdownModal = useFlashCardGameCountdownModal(props);

  if (!props.countdownDetails) return null;

  return (
    <QuizModalShell
      className="max-w-[560px] overflow-hidden text-center"
      dialogRef={flashCardGameCountdownModal.modalAccessibility.dialogRef}
      isOpen={props.isOpen}
      isVisible={flashCardGameCountdownModal.modalAccessibility.isVisible}
      labelledBy="flash-card-game-countdown-title"
    >
      <div className="bg-primary-accent px-6 py-7 text-surface sm:py-8">
        <Puzzle
          aria-hidden="true"
          strokeWidth={1.8}
          className="mx-auto h-14 w-14"
        />
        <h2
          id="flash-card-game-countdown-title"
          className="mt-3 text-2xl font-semibold"
        >
          Flash Card Game
        </h2>
        <p className="mt-2 text-base font-semibold">
          {props.countdownDetails.areaName}
        </p>
      </div>

      <div className="px-6 py-8 sm:px-10 sm:py-9">
        <p className="text-xl font-semibold text-primary-text">Get Ready!</p>
        <p className="mt-2 text-xl font-semibold text-secondary-text">
          {flashCardGameCountdownModal.areSoundsReady
            ? "Game is starting in"
            : "Preparing game sounds"}
        </p>
        <div
          className="my-7 min-h-24 text-8xl font-semibold tabular-nums text-primary-accent transition-opacity duration-300"
          aria-live="assertive"
          aria-atomic="true"
        >
          {!flashCardGameCountdownModal.areSoundsReady ? (
            <LoaderCircle className="mx-auto h-14 w-14 animate-spin" />
          ) : flashCardGameCountdownModal.countdown > 0 ? (
            flashCardGameCountdownModal.countdown
          ) : flashCardGameCountdownModal.isStarting ? (
            <LoaderCircle className="mx-auto h-14 w-14 animate-spin" />
          ) : (
            ""
          )}
        </div>

        {flashCardGameCountdownModal.error && (
          <p role="alert" className="mb-5 text-sm text-error">
            {flashCardGameCountdownModal.error}
          </p>
        )}

        <button
          type="button"
          onClick={flashCardGameCountdownModal.handleCancel}
          disabled={flashCardGameCountdownModal.isStarting}
          className="flex h-12 w-full cursor-pointer items-center justify-center rounded bg-primary-accent text-base font-semibold text-surface transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {flashCardGameCountdownModal.isStarting ? (
            <LoaderCircle className="h-5 w-5 animate-spin" />
          ) : (
            "Cancel Game"
          )}
        </button>
      </div>
    </QuizModalShell>
  );
}
