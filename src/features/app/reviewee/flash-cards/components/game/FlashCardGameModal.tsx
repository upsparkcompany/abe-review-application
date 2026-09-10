import { ClockIcon, XMarkIcon } from "@heroicons/react/24/outline";
import FlashCardExitGameConfirmationModal from "@/features/app/reviewee/flash-cards/components/game/FlashCardExitGameConfirmationModal";
import { useFlashCardGameModal } from "@/features/app/reviewee/flash-cards/hooks/modals/game/useFlashCardGameModal";
import type {
  FlashCardSummary,
  FlashCardTiming,
  PreparedFlashCardSession,
} from "@/features/app/reviewee/flash-cards/types/flashCardGame";
import QuizModalShell from "@/features/app/reviewee/mcq-quiz/components/QuizModalShell";
import { LoaderCircle } from "lucide-react";

export type FlashCardGameModalProps = {
  initialTiming: FlashCardTiming | null;
  isOpen: boolean;
  onFinished: (summary: FlashCardSummary) => void;
  preparedSession: PreparedFlashCardSession | null;
};

export default function FlashCardGameModal(props: FlashCardGameModalProps) {
  const flashCardGameModal = useFlashCardGameModal(props);

  if (
    !props.preparedSession ||
    !flashCardGameModal.currentTiming ||
    !flashCardGameModal.currentFlashCard
  ) {
    return null;
  }

  const isAnswerLocked = flashCardGameModal.phase !== "answering";
  const showResult =
    flashCardGameModal.phase === "result" &&
    flashCardGameModal.answerReveal !== null;
  const showTimer =
    flashCardGameModal.phase !== "result" &&
    flashCardGameModal.phase !== "transitioning";
  const resultIsCorrect = flashCardGameModal.answerReveal?.isCorrect === true;
  const resultIsIncorrect =
    flashCardGameModal.answerReveal?.isCorrect === false;
  const timerIsCritical = flashCardGameModal.remainingSeconds <= 3;

  const answerFieldClassName = resultIsCorrect
    ? "border-primary-light bg-teal-50 text-primary-dark"
    : resultIsIncorrect
      ? "border-red-400 bg-red-50 text-red-600"
      : "border-border bg-surface text-primary-text";

  return (
    <>
      <QuizModalShell
        className="h-dvh max-h-dvh max-w-none overflow-hidden rounded-none md:h-auto md:max-h-[calc(100dvh-2rem)] md:max-w-[795px] md:rounded-lg sm:overflow-y-auto sm:p-8 lg:px-9 lg:py-10"
        dialogRef={flashCardGameModal.modalAccessibility.dialogRef}
        isInert={flashCardGameModal.isExitConfirmationOpen}
        isOpen={props.isOpen}
        isVisible={flashCardGameModal.modalAccessibility.isVisible}
        labelledBy="flash-card-game-title"
        overlayClassName="bg-slate-950/45 !px-0 !py-0 md:!px-4 md:!py-4"
      >
        <button
          type="button"
          onClick={flashCardGameModal.handleOpenExitConfirmation}
          className="absolute top-5 right-5 cursor-pointer rounded text-secondary-text transition-colors hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light sm:top-8 sm:right-8"
          aria-label="End flash card game"
        >
          <XMarkIcon className="h-7 w-7" />
        </button>

        <div
          className={`flex h-full flex-col overflow-hidden p-5 sm:contents ${
            flashCardGameModal.error ? "pb-[158px]" : "pb-[82px]"
          }`}
        >
          <div className="shrink-0 bg-surface">
            <header className="border-b border-border pb-5 pr-10">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="flash-card-game-title"
                  className="text-xl font-semibold text-primary-text"
                >
                  {props.preparedSession.areaName}
                </h2>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-primary-accent">
                  Flash Cards
                </span>
              </div>
              <p className="mt-2 text-base text-secondary-text">
                {props.preparedSession.totalFlashCards} Flash Cards
              </p>
            </header>

            <div className="relative mt-5 flex min-h-[48px] flex-wrap items-center justify-between gap-3 md:justify-center">
              <div className="relative min-h-[40px] min-w-[190px] flex-1 max-w-[330px] sm:min-h-[48px] sm:min-w-[250px]">
                <div
                  className={`absolute inset-0 flex items-center justify-start transition-opacity duration-300 md:justify-center ${
                    showTimer ? "opacity-100" : "opacity-0"
                  }`}
                  aria-hidden={!showTimer}
                >
                  <div
                    className="flex h-10 items-center gap-1.5 rounded border border-border bg-secondary-bg px-3 text-sm text-secondary-text transition-opacity duration-300 sm:h-[46px] sm:gap-2 sm:px-4 sm:text-base"
                    aria-label={`${flashCardGameModal.remainingSeconds} seconds remaining`}
                  >
                    <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Timer:</span>
                    <span
                      className={`font-semibold tabular-nums ${
                        timerIsCritical ? "text-error" : "text-primary-accent"
                      }`}
                    >
                      {flashCardGameModal.remainingSeconds}{" "}
                      {flashCardGameModal.remainingSeconds === 1
                        ? "second"
                        : "seconds"}
                    </span>
                  </div>
                </div>
                <p
                  className={`absolute inset-0 flex items-center justify-center text-center text-base font-semibold transition-opacity duration-300 ${
                    showResult ? "opacity-100" : "opacity-0"
                  } ${resultIsCorrect ? "text-primary-accent" : "text-error"}`}
                  role="status"
                  aria-live="polite"
                  aria-hidden={!showResult}
                >
                  {resultIsCorrect
                    ? "Great job! You got the correct answer."
                    : "That answer is incorrect."}
                </p>
              </div>

              <span className="ml-auto shrink-0 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-primary-accent sm:px-4 sm:py-2 sm:text-sm md:absolute md:top-1/2 md:right-0 md:-translate-y-1/2">
                {flashCardGameModal.currentTiming.cardOrder}/
                {props.preparedSession.totalFlashCards} Flash Cards
              </span>
            </div>

            <div
              className={`mt-6 shrink-0 transition-opacity duration-300 motion-reduce:transition-none ${
                flashCardGameModal.isFlashCardVisible
                  ? "opacity-100"
                  : "opacity-0"
              }`}
            >
              <div>
                <h3 className="mb-2 text-base font-semibold text-primary-text">
                  Question
                </h3>
                <div className="min-h-[125px] whitespace-pre-wrap rounded border border-border bg-secondary-bg p-4 text-sm leading-6 text-primary-text sm:p-5">
                  {flashCardGameModal.currentFlashCard.questionText}
                </div>
              </div>
            </div>
          </div>

          <div
            className={`mt-5 min-h-0 flex-1 overflow-y-auto pb-3 transition-opacity duration-300 motion-reduce:transition-none sm:overflow-visible sm:pb-0 ${
              flashCardGameModal.isFlashCardVisible
                ? "opacity-100"
                : "opacity-0"
            }`}
          >
            <div>
              <label
                htmlFor="flash-card-game-answer"
                className="mb-2 block text-base font-semibold text-primary-text"
              >
                Answer
              </label>
              <textarea
                ref={flashCardGameModal.answerInputRef}
                id="flash-card-game-answer"
                value={flashCardGameModal.answer}
                onChange={(event) =>
                  flashCardGameModal.handleAnswerChange(event.target.value)
                }
                disabled={isAnswerLocked}
                maxLength={2000}
                rows={3}
                className={`min-h-[75px] w-full resize-y rounded border p-4 text-sm leading-6 outline-none transition-colors focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 disabled:resize-none disabled:opacity-100 ${answerFieldClassName}`}
              />

              {resultIsIncorrect && flashCardGameModal.answerReveal && (
                <p
                  className="mt-3 rounded border border-teal-400 bg-teal-50 px-4 py-3 text-sm leading-6 text-primary-dark"
                  role="status"
                >
                  <span className="font-semibold">Correct:</span>{" "}
                  <span className="whitespace-pre-wrap">
                    {flashCardGameModal.answerReveal.correctAnswer}
                  </span>
                </p>
              )}
            </div>

            {flashCardGameModal.error && (
              <div className="mt-5 hidden flex-col items-start gap-3 rounded border border-red-200 bg-red-50 p-4 sm:flex sm:flex-row sm:items-center sm:justify-between">
                <p role="alert" className="text-sm text-red-600">
                  {flashCardGameModal.error}
                </p>
                {flashCardGameModal.phase !== "answering" && (
                  <button
                    type="button"
                    onClick={flashCardGameModal.handleRetry}
                    className="shrink-0 cursor-pointer text-sm font-semibold text-red-700 underline underline-offset-2"
                  >
                    Try Again
                  </button>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={flashCardGameModal.handleSubmitAnswer}
              disabled={
                !flashCardGameModal.answer.trim() ||
                flashCardGameModal.phase !== "answering"
              }
              className="mt-5 hidden h-[50px] w-full cursor-pointer items-center justify-center rounded bg-primary-accent px-5 text-base font-semibold text-surface transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:flex"
            >
              {flashCardGameModal.phase === "checking" ? (
                <>
                  <span>Checking answer &nbsp;</span>
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                </>
              ) : flashCardGameModal.phase === "transitioning" ? (
                "Loading Next Flash Card..."
              ) : (
                "Submit Answer"
              )}
            </button>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 bg-surface px-5 pt-3 pb-5 shadow-[0_-8px_18px_rgba(15,23,42,0.08)] sm:hidden">
          {flashCardGameModal.error && (
            <div className="mb-3 flex flex-col items-start gap-2 rounded border border-red-200 bg-red-50 p-3">
              <p role="alert" className="text-sm text-red-600">
                {flashCardGameModal.error}
              </p>
              {flashCardGameModal.phase !== "answering" && (
                <button
                  type="button"
                  onClick={flashCardGameModal.handleRetry}
                  className="shrink-0 cursor-pointer text-sm font-semibold text-red-700 underline underline-offset-2"
                >
                  Try Again
                </button>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={flashCardGameModal.handleSubmitAnswer}
            disabled={
              !flashCardGameModal.answer.trim() ||
              flashCardGameModal.phase !== "answering"
            }
            className="flex h-[50px] w-full cursor-pointer items-center justify-center rounded bg-primary-accent px-5 text-base font-semibold text-surface transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {flashCardGameModal.phase === "checking" ? (
              <>
                <span>Checking answer &nbsp;</span>
                <LoaderCircle className="h-5 w-5 animate-spin" />
              </>
            ) : flashCardGameModal.phase === "transitioning" ? (
              "Loading Next Flash Card..."
            ) : (
              "Submit Answer"
            )}
          </button>
        </div>
      </QuizModalShell>

      <FlashCardExitGameConfirmationModal
        isOpen={flashCardGameModal.isExitConfirmationOpen}
        onCancel={flashCardGameModal.handleCancelExitConfirmation}
        onExited={flashCardGameModal.handleExited}
        sessionId={props.preparedSession.sessionId}
      />
    </>
  );
}
