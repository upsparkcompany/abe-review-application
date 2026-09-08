import type { AdminSubject } from "@/features/app/admin/question-bank/actions/fetch-subject-areas.action";
import type { AdminQuestionSet } from "@/features/app/admin/question-bank/actions/fetch-subject-question-sets.action";
import {
  QUESTION_BANK_DIFFICULTIES,
  QUESTION_BANK_GAME_TYPES,
  QUESTION_BANK_OPTION_LABELS,
  type QuestionBankSummary,
} from "@/features/app/admin/question-bank/constants/questionBank";
import type { QuestionFormModalRequest } from "@/features/app/admin/question-bank/hooks/modals/useSubjectDetailsModal";
import { useQuestionFormModal } from "@/features/app/admin/question-bank/hooks/modals/useQuestionFormModal";
import { useModalAnimation } from "@/hooks/useModalAnimation";
import { LoaderCircle } from "lucide-react";
import { XMarkIcon } from "@heroicons/react/24/outline";

type QuestionFormData = {
  correctOptionSortOrder: string;
  difficulty: string;
  gameType: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  questionText: string;
};

type QuestionFormModalProps = {
  loadSubjectQuestions: (subjectId: number) => Promise<void>;
  onClose: () => void;
  questionSets: AdminQuestionSet[];
  questionSummaries: QuestionBankSummary[];
  request: QuestionFormModalRequest | null;
  selectedSubject: AdminSubject | null;
  showSuccessMessage: (message: string) => void;
};

export default function QuestionFormModal({
  loadSubjectQuestions,
  onClose,
  questionSets,
  questionSummaries,
  request,
  selectedSubject,
  showSuccessMessage,
}: QuestionFormModalProps) {
  const questionFormModal = useQuestionFormModal({
    loadSubjectQuestions,
    onClose,
    questionSets,
    questionSummaries,
    request,
    selectedSubject,
    showSuccessMessage,
  });
  const modalAnimation = useModalAnimation(
    questionFormModal.openQuestionFormModal,
  );
  const isEditMode = questionFormModal.questionFormMode === "edit";
  const isQuestionSetLocked = request?.isQuestionSetLocked === true;

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-center justify-center px-4 transition-opacity duration-300 ${
        modalAnimation.isModalVisible
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
    >
      <div
        className="absolute inset-0 bg-slate-950/35"
        onClick={() => modalAnimation.closeWithAnimation(questionFormModal.handleCloseQuestionFormModal)}
      ></div>

      <div
        className={`relative max-h-[calc(100dvh-2rem)] w-full max-w-[760px] overflow-hidden rounded-md bg-surface shadow-xl transition-all duration-300 ease-out sm:overflow-y-auto sm:p-9 ${
          modalAnimation.isModalVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "-translate-y-4 scale-95 opacity-0"
        }`}
      >
        <div className="max-h-[88vh] overflow-y-auto p-6 pb-28 sm:contents">
          <button
          type="button"
          onClick={() => modalAnimation.closeWithAnimation(questionFormModal.handleCloseQuestionFormModal)}
          className="absolute top-9 right-9 cursor-pointer"
          aria-label="Close question form"
        >
          <XMarkIcon className="h-7 w-7 text-secondary-text" />
        </button>

        <div className="mb-6 border-b border-border pb-5">
          <h2 className="text-xl font-semibold text-primary-text">
            {isEditMode ? "Edit Question" : "Add Question"}
          </h2>
          <p className="mt-2 text-base font-medium text-secondary-text">
            {selectedSubject?.name}
          </p>
        </div>

        <form
          id="question-form"
          onSubmit={questionFormModal.handleSaveQuestion}
          className="flex flex-col gap-5"
        >
          <input
            type="hidden"
            name="subjectId"
            value={selectedSubject?.id ?? ""}
          />
          {isEditMode && (
            <input
              type="hidden"
              name="questionId"
              value={questionFormModal.selectedEditQuestionId ?? ""}
            />
          )}
          {isQuestionSetLocked && (
            <>
              <input
                type="hidden"
                name="gameType"
                value={questionFormModal.questionFormData.gameType}
              />
              <input
                type="hidden"
                name="difficulty"
                value={questionFormModal.questionFormData.difficulty}
              />
            </>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="gameType" className="text-base font-semibold">
                Game Type
              </label>
              <select
                id="gameType"
                name={isQuestionSetLocked ? undefined : "gameType"}
                value={questionFormModal.questionFormData.gameType}
                onChange={questionFormModal.handleQuestionInput}
                disabled={isQuestionSetLocked}
                className="h-[50px] rounded border border-border bg-surface px-5 text-base outline-none focus:border-primary-accent disabled:cursor-not-allowed disabled:bg-secondary-bg disabled:text-secondary-text"
              >
                {QUESTION_BANK_GAME_TYPES.map((gameType) => (
                  <option key={gameType} value={gameType}>
                    {gameType}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="difficulty" className="text-base font-semibold">
                Difficulty
              </label>
              <select
                id="difficulty"
                name={isQuestionSetLocked ? undefined : "difficulty"}
                value={questionFormModal.questionFormData.difficulty}
                onChange={questionFormModal.handleQuestionInput}
                disabled={isQuestionSetLocked}
                className="h-[50px] rounded border border-border bg-surface px-5 text-base outline-none focus:border-primary-accent disabled:cursor-not-allowed disabled:bg-secondary-bg disabled:text-secondary-text"
              >
                {QUESTION_BANK_DIFFICULTIES.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="questionText" className="text-base font-semibold">
              Question
            </label>
            <textarea
              id="questionText"
              name="questionText"
              value={questionFormModal.questionFormData.questionText}
              onChange={questionFormModal.handleQuestionInput}
              rows={5}
              maxLength={1000}
              className="resize-none rounded border border-border px-4 py-3 text-sm outline-none focus:border-primary-accent"
            />
          </div>

          <div>
            <p className="mb-5 text-sm font-medium text-secondary-text">
              Select the correct answer
            </p>
            <div className="grid gap-5 md:grid-cols-2">
              {[1, 2, 3, 4].map((optionNumber) => {
                const isSelected =
                  questionFormModal.questionFormData.correctOptionSortOrder ===
                  String(optionNumber);

                return (
                  <div key={optionNumber} className="flex flex-col gap-2">
                    <label
                      htmlFor={`option${optionNumber}`}
                      className="text-base font-semibold"
                    >
                      Option {QUESTION_BANK_OPTION_LABELS[optionNumber - 1]}
                    </label>
                    <div
                      className={`flex h-[50px] items-center gap-3 rounded border px-3 transition-colors focus-within:border-primary-accent ${
                        isSelected
                          ? "border-primary-accent bg-[#E0F2F1]"
                          : "border-border bg-surface"
                      }`}
                    >
                      <input
                        type="radio"
                        name="correctOptionSortOrder"
                        value={optionNumber}
                        checked={isSelected}
                        onChange={questionFormModal.handleQuestionInput}
                        className="h-4 w-4 shrink-0 accent-primary-accent"
                      />
                      <input
                        id={`option${optionNumber}`}
                        type="text"
                        name={`option${optionNumber}`}
                        value={
                          questionFormModal.questionFormData[
                            `option${optionNumber}` as keyof QuestionFormData
                          ]
                        }
                        onChange={questionFormModal.handleQuestionInput}
                        maxLength={255}
                        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={questionFormModal.isSavingQuestion}
            className="hidden h-[50px] cursor-pointer items-center justify-center rounded bg-primary-accent px-5 text-base font-semibold text-surface transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70 sm:flex"
          >
            {questionFormModal.isSavingQuestion ? (
              <LoaderCircle className="animate-spin" />
            ) : isEditMode ? (
              "Save Question"
            ) : (
              "Create Question"
            )}
          </button>

          {questionFormModal.questionFormError && (
            <p className="text-sm text-error">{questionFormModal.questionFormError}</p>
          )}
          </form>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 bg-surface px-6 pt-3 pb-6 shadow-[0_-8px_18px_rgba(15,23,42,0.08)] sm:hidden">
          <button
            type="submit"
            form="question-form"
            disabled={questionFormModal.isSavingQuestion}
            className="flex h-[50px] w-full cursor-pointer items-center justify-center rounded bg-primary-accent px-5 text-base font-semibold text-surface transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {questionFormModal.isSavingQuestion ? (
              <LoaderCircle className="animate-spin" />
            ) : isEditMode ? (
              "Save Question"
            ) : (
              "Create Question"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
