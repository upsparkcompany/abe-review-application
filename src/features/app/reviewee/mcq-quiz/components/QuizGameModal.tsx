import { ClockIcon, XMarkIcon } from "@heroicons/react/24/outline";
import ExitGameConfirmationModal from "@/features/app/reviewee/mcq-quiz/components/ExitGameConfirmationModal";
import QuizAnswerOption from "@/features/app/reviewee/mcq-quiz/components/QuizAnswerOption";
import QuizModalShell from "@/features/app/reviewee/mcq-quiz/components/QuizModalShell";
import { useQuizGameModal } from "@/features/app/reviewee/mcq-quiz/hooks/modals/useQuizGameModal";
import { LoaderCircle } from "lucide-react";
import type {
  PreparedQuizSession,
  QuizQuestionTiming,
  QuizSummary,
} from "@/features/app/reviewee/mcq-quiz/types/quiz";

export type QuizGameModalProps = {
  initialTiming: QuizQuestionTiming | null;
  isOpen: boolean;
  onFinished: (summary: QuizSummary) => void;
  preparedSession: PreparedQuizSession | null;
};

const OPTION_LABELS = ["A", "B", "C", "D"];

export default function QuizGameModal(props: QuizGameModalProps) {
  const quizGameModal = useQuizGameModal(props);

  if (
    !props.preparedSession ||
    !quizGameModal.currentTiming ||
    !quizGameModal.currentQuestion
  ) {
    return null;
  }

  const isAnswerLocked = quizGameModal.phase !== "answering";
  const showResult =
    quizGameModal.phase === "result" && quizGameModal.answerReveal !== null;
  const showTimer =
    quizGameModal.phase !== "result" &&
    quizGameModal.phase !== "transitioning";
  const resultIsCorrect = quizGameModal.answerReveal?.isCorrect === true;
  const timerIsCritical = quizGameModal.remainingSeconds <= 3;

  return (
    <>
      <QuizModalShell
        className="h-dvh max-h-dvh max-w-none overflow-hidden rounded-none md:h-auto md:max-h-[calc(100dvh-2rem)] md:max-w-[935px] md:rounded-lg sm:overflow-y-auto sm:p-8 lg:p-10"
        dialogRef={quizGameModal.modalAccessibility.dialogRef}
        isInert={quizGameModal.isExitConfirmationOpen}
        isOpen={props.isOpen}
        isVisible={quizGameModal.modalAccessibility.isVisible}
        labelledBy="quiz-game-title"
        overlayClassName="bg-slate-950/45 !px-0 !py-0 md:!px-4 md:!py-4"
      >
        <button
          type="button"
          onClick={quizGameModal.handleOpenExitConfirmation}
          className="absolute top-5 right-5 cursor-pointer rounded text-secondary-text transition-colors hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light sm:top-8 sm:right-8"
          aria-label="End game"
        >
          <XMarkIcon className="h-7 w-7" />
        </button>

        <div
          className={`flex h-full flex-col overflow-hidden p-5 sm:contents ${
            quizGameModal.error ? "pb-[158px]" : "pb-[82px]"
          }`}
        >
          <div className="shrink-0 bg-surface">
            <header className="border-b border-border pb-5 pr-10">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="quiz-game-title"
                  className="text-xl font-semibold text-primary-text"
                >
                  {props.preparedSession.areaName}
                </h2>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-primary-accent">
                  MCQ Quiz
                </span>
              </div>
              <p className="mt-2 text-base text-secondary-text">
                {props.preparedSession.gameType}
                {props.preparedSession.difficulty
                  ? ` (${props.preparedSession.difficulty})`
                  : ""}
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
                    aria-label={`${quizGameModal.remainingSeconds} seconds remaining`}
                  >
                    <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Timer:</span>
                    <span
                      className={`font-semibold tabular-nums ${
                        timerIsCritical ? "text-error" : "text-primary-accent"
                      }`}
                    >
                      {quizGameModal.remainingSeconds}{" "}
                      {quizGameModal.remainingSeconds === 1
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
                  {quizGameModal.answerReveal &&
                    (resultIsCorrect
                      ? "Great job! You got the correct answer."
                      : "That answer is incorrect.")}
                </p>
              </div>

              <span className="ml-auto shrink-0 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-primary-accent sm:px-4 sm:py-2 sm:text-sm md:absolute md:top-1/2 md:right-0 md:-translate-y-1/2">
                {quizGameModal.currentTiming.questionOrder}/
                {props.preparedSession.totalQuestions} Questions
              </span>
            </div>

            <div
              className={`mt-6 shrink-0 transition-opacity duration-300 motion-reduce:transition-none ${
                quizGameModal.isQuestionVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              <div>
                <h3 className="mb-2 text-base font-semibold text-primary-text">
                  Question
                </h3>
                <div className="min-h-[125px] whitespace-pre-wrap rounded border border-border bg-secondary-bg p-4 text-sm leading-6 text-primary-text sm:p-5">
                  {quizGameModal.currentQuestion.questionText}
                </div>
              </div>
            </div>

            <p
              className={`mt-4 text-sm font-medium text-secondary-text sm:mt-5 ${
                quizGameModal.isQuestionVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              Fill out the options and select the correct answer
            </p>
          </div>

          <div
            className={`mt-4 min-h-0 flex-1 overflow-y-auto pb-3 transition-opacity duration-300 motion-reduce:transition-none sm:mt-5 sm:overflow-visible sm:pb-0 ${
              quizGameModal.isQuestionVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {quizGameModal.randomizedOptions.map((option, optionIndex) => (
                <QuizAnswerOption
                  key={option.id}
                  answerReveal={quizGameModal.answerReveal}
                  disabled={isAnswerLocked}
                  isSelected={quizGameModal.selectedOptionId === option.id}
                  label={
                    OPTION_LABELS[optionIndex] ?? String(optionIndex + 1)
                  }
                  onSelect={quizGameModal.handleSelectOption}
                  option={option}
                />
              ))}
            </div>

            {quizGameModal.error && (
              <div className="mt-5 hidden flex-col items-start gap-3 rounded border border-red-200 bg-red-50 p-4 sm:flex sm:flex-row sm:items-center sm:justify-between">
                <p role="alert" className="text-sm text-red-600">
                  {quizGameModal.error}
                </p>
                {quizGameModal.phase !== "answering" && (
                  <button
                    type="button"
                    onClick={quizGameModal.handleRetry}
                    className="shrink-0 cursor-pointer text-sm font-semibold text-red-700 underline underline-offset-2"
                  >
                    Try Again
                  </button>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={quizGameModal.handleSubmitAnswer}
              disabled={
                quizGameModal.selectedOptionId === null ||
                quizGameModal.phase !== "answering"
              }
              className="mt-5 hidden h-[50px] w-full cursor-pointer items-center justify-center rounded bg-primary-accent px-5 text-base font-semibold text-surface transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:flex"
            >
              {quizGameModal.phase === "checking" ? (
                <>
                  <span>Checking answer &nbsp;</span>
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                </>
              ) : quizGameModal.phase === "transitioning" ? (
                "Loading Next Question..."
              ) : (
                "Submit Answer"
              )}
            </button>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 bg-surface px-5 pt-3 pb-5 shadow-[0_-8px_18px_rgba(15,23,42,0.08)] sm:hidden">
          {quizGameModal.error && (
            <div className="mb-3 flex flex-col items-start gap-2 rounded border border-red-200 bg-red-50 p-3">
              <p role="alert" className="text-sm text-red-600">
                {quizGameModal.error}
              </p>
              {quizGameModal.phase !== "answering" && (
                <button
                  type="button"
                  onClick={quizGameModal.handleRetry}
                  className="shrink-0 cursor-pointer text-sm font-semibold text-red-700 underline underline-offset-2"
                >
                  Try Again
                </button>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={quizGameModal.handleSubmitAnswer}
            disabled={
              quizGameModal.selectedOptionId === null ||
              quizGameModal.phase !== "answering"
            }
            className="flex h-[50px] w-full cursor-pointer items-center justify-center rounded bg-primary-accent px-5 text-base font-semibold text-surface transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {quizGameModal.phase === "checking" ? (
              <>
                <span>Checking answer &nbsp;</span>
                <LoaderCircle className="h-5 w-5 animate-spin" />
              </>
            ) : quizGameModal.phase === "transitioning" ? (
              "Loading Next Question..."
            ) : (
              "Submit Answer"
            )}
          </button>
        </div>
      </QuizModalShell>

      <ExitGameConfirmationModal
        isOpen={quizGameModal.isExitConfirmationOpen}
        onCancel={quizGameModal.handleCancelExitConfirmation}
        onExited={quizGameModal.handleExited}
        sessionId={props.preparedSession.sessionId}
      />
    </>
  );
}
