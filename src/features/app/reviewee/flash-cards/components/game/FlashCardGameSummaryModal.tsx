import GameSummaryHeader from "@/features/app/reviewee/components/GameSummaryHeader";
import GameConfetti from "@/components/ui/GameConfetti";
import { useFlashCardGameSummaryModal } from "@/features/app/reviewee/flash-cards/hooks/modals/game/useFlashCardGameSummaryModal";
import type { FlashCardSummary } from "@/features/app/reviewee/flash-cards/types/flashCardGame";
import QuizModalShell from "@/features/app/reviewee/mcq-quiz/components/QuizModalShell";

export type FlashCardGameSummaryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  summary: FlashCardSummary | null;
};

export default function FlashCardGameSummaryModal(
  props: FlashCardGameSummaryModalProps,
) {
  const flashCardGameSummaryModal = useFlashCardGameSummaryModal(props);

  if (!props.summary) return null;

  return (
    <QuizModalShell
      className="flex max-h-[calc(100dvh-2rem)] max-w-[475px] flex-col overflow-hidden"
      dialogRef={flashCardGameSummaryModal.modalAccessibility.dialogRef}
      isOpen={props.isOpen}
      isVisible={flashCardGameSummaryModal.modalAccessibility.isVisible}
      labelledBy="flash-card-game-summary-title"
      overlayClassName="bg-slate-950/45"
      underlay={
        flashCardGameSummaryModal.isPerfectResult ? <GameConfetti /> : undefined
      }
    >
      <div className="min-h-0 flex-1 overflow-y-auto pb-4 sm:pb-0">
        <GameSummaryHeader
          metadata={props.summary.areaName}
          title={
            props.summary.endReason === "completed"
              ? "Flash Card Game Complete!"
              : "Flash Card Game Ended!"
          }
          titleId="flash-card-game-summary-title"
        />

        <div className="px-6 py-9 sm:px-10 sm:pb-5 sm:pt-10">
        <p className="text-center text-base font-medium text-primary-text">
          Your score percentage was:
        </p>

        <div
          aria-label={`${flashCardGameSummaryModal.scorePercentage}% correct across ${flashCardGameSummaryModal.gameProgress} played questions. ${props.summary.correct} correct, ${props.summary.incorrect} wrong, and ${props.summary.timedOut} timed out.`}
          className="mx-auto mt-5 flex h-28 w-28 items-center justify-center rounded-full"
          role="img"
          style={{ background: flashCardGameSummaryModal.donutBackground }}
        >
          <div className="flex h-[88px] w-[88px] flex-col items-center justify-center rounded-full bg-surface">
            <span className="text-xl font-semibold leading-5 text-primary-text">
              {flashCardGameSummaryModal.scorePercentage}%
            </span>
            <span className="text-xs text-secondary-text">Correct</span>
          </div>
        </div>

        <p className="mt-3 text-center text-sm font-medium text-primary-accent">
          {flashCardGameSummaryModal.performanceMessage}
        </p>

        <section className="mt-6" aria-labelledby="flash-card-score-summary-heading">
          <h3
            id="flash-card-score-summary-heading"
            className="text-sm font-medium text-primary-text"
          >
            Score Summary
          </h3>

          <dl className="mt-1 grid grid-cols-2 gap-2.5">
            <div className="flex min-h-[100px] flex-col items-center justify-center rounded border border-border bg-secondary-bg px-2 text-center">
              <dt className="order-2 mt-1 text-[13px] text-secondary-text">
                Game Progress
              </dt>
              <dd className="order-1 text-xl font-semibold text-secondary-text">
                {flashCardGameSummaryModal.gameProgress}/
                {props.summary.totalQuestions}
              </dd>
            </div>
            <div className="flex min-h-[100px] flex-col items-center justify-center rounded border border-border bg-secondary-bg px-2 text-center">
              <dt className="order-2 mt-1 text-[13px] text-secondary-text">
                Game Duration
              </dt>
              <dd className="order-1 text-xl font-semibold text-secondary-text">
                {flashCardGameSummaryModal.duration}
              </dd>
            </div>
          </dl>

          <dl className="mt-2.5 grid grid-cols-3 gap-2.5">
            <div className="flex min-h-[75px] flex-col items-center justify-center rounded border border-primary-accent bg-teal-50 px-1 text-center">
              <dt className="order-2 mt-0.5 text-[13px] text-primary-accent">
                Correct
              </dt>
              <dd className="order-1 text-base font-medium text-primary-accent">
                {props.summary.correct}
              </dd>
            </div>
            <div className="flex min-h-[75px] flex-col items-center justify-center rounded border border-error bg-red-50 px-1 text-center">
              <dt className="order-2 mt-0.5 text-[13px] text-error">Wrong</dt>
              <dd className="order-1 text-base font-medium text-error">
                {props.summary.incorrect}
              </dd>
            </div>
            <div className="flex min-h-[75px] flex-col items-center justify-center rounded border border-warning bg-amber-50 px-1 text-center">
              <dt className="order-2 mt-0.5 text-[13px] text-warning">
                Timed Out
              </dt>
              <dd className="order-1 text-base font-medium text-warning">
                {props.summary.timedOut}
              </dd>
            </div>
          </dl>
        </section>
        </div>
      </div>

      <div className="shrink-0 bg-surface px-6 pb-6 pt-3 shadow-[0_-8px_18px_rgba(15,23,42,0.08)] sm:px-10 sm:pb-10 sm:pt-0 sm:shadow-none">
        <button
          ref={flashCardGameSummaryModal.closeButtonRef}
          type="button"
          onClick={props.onClose}
          className="h-[50px] w-full cursor-pointer rounded bg-primary-accent text-base font-medium text-surface transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2"
        >
          Back to Flash Cards
        </button>
      </div>
    </QuizModalShell>
  );
}
