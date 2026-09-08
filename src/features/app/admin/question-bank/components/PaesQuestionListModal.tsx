import type { AdminSubject } from "@/features/app/admin/question-bank/actions/fetch-subject-areas.action";
import DeleteQuestionConfirmationModal from "@/features/app/admin/question-bank/components/DeleteQuestionConfirmationModal";
import PaesQuestionFormModal from "@/features/app/admin/question-bank/components/PaesQuestionFormModal";
import QuestionListPagination from "@/features/app/admin/question-bank/components/QuestionListPagination";
import SubjectDetailsSkeleton from "@/features/app/admin/question-bank/components/SubjectDetailsSkeleton";
import { QUESTION_BANK_OPTION_LABELS } from "@/features/app/admin/question-bank/constants/questionBank";
import { usePaesQuestionListModal } from "@/features/app/admin/question-bank/hooks/modals/usePaesQuestionListModal";
import { useModalAnimation } from "@/hooks/useModalAnimation";
import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

type PaesQuestionListModalProps = {
  onClose: () => void;
  open: boolean;
  showSuccessMessage: (message: string) => void;
  subject: AdminSubject | null;
  subjects: AdminSubject[];
};

export default function PaesQuestionListModal({
  onClose,
  open,
  showSuccessMessage,
  subject,
  subjects,
}: PaesQuestionListModalProps) {
  const paesQuestionListModal = usePaesQuestionListModal({
    onClose,
    subject,
  });
  const modalAnimation = useModalAnimation(open);
  const isChildModalOpen =
    paesQuestionListModal.questionFormRequest !== null ||
    paesQuestionListModal.selectedDeleteQuestion !== null;

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto px-4 py-4 transition-opacity duration-300 ${
          modalAnimation.isModalVisible
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!modalAnimation.isModalVisible || isChildModalOpen}
        inert={isChildModalOpen}
      >
        <div
          className="absolute inset-0 bg-slate-950/35"
          onClick={() => modalAnimation.closeWithAnimation(paesQuestionListModal.handleCloseQuestionListModal)}
        ></div>

        <div
          className={`relative max-h-[calc(100dvh-2rem)] w-full max-w-[940px] overflow-y-auto rounded-md bg-surface p-5 shadow-xl transition-all duration-300 ease-out sm:p-10 ${
            modalAnimation.isModalVisible
              ? "translate-y-0 scale-100 opacity-100"
              : "-translate-y-4 scale-95 opacity-0"
          }`}
        >
          <div className="mb-5 flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-primary-text">
                {subject?.name}
              </h2>
              <p className="mt-2 text-base font-medium text-secondary-text">
                {paesQuestionListModal.questions.length}{" "}
                {paesQuestionListModal.questions.length === 1 ? "Question" : "Questions"}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <label className="relative min-w-0 flex-1 sm:w-[275px] sm:flex-none">
                <span className="sr-only">Search PAES questions</span>
                <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={paesQuestionListModal.searchQuery}
                  onChange={paesQuestionListModal.handleSearchQueryChange}
                  placeholder="Search a question"
                  className="h-10 w-full rounded-full border border-border bg-surface pr-4 pl-10 text-sm text-primary-text outline-none placeholder:text-slate-400 focus:border-primary-accent focus:ring-2 focus:ring-[#E0F2F1]"
                />
              </label>
              <button
                type="button"
                onClick={() => modalAnimation.closeWithAnimation(paesQuestionListModal.handleCloseQuestionListModal)}
                className="cursor-pointer text-secondary-text"
                aria-label="Close PAES question list"
              >
                <XMarkIcon className="h-7 w-7" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={paesQuestionListModal.handleOpenCreateQuestionModal}
            className="mb-5 h-10 w-full cursor-pointer rounded border border-border bg-surface text-sm font-semibold text-primary-text transition-colors hover:border-primary-accent hover:text-primary-accent"
          >
            + Add Question
          </button>

          {paesQuestionListModal.isLoadingQuestions ? (
            <SubjectDetailsSkeleton />
          ) : paesQuestionListModal.questionsError ? (
            <div className="rounded border border-red-200 bg-red-50 p-5 text-sm text-red-600">
              {paesQuestionListModal.questionsError}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {paesQuestionListModal.paginatedQuestions.length > 0 ? (
                paesQuestionListModal.paginatedQuestions.map((question) => {
                  const questionNumber =
                    paesQuestionListModal.questions.findIndex(
                      (activeQuestion) => activeQuestion.id === question.id,
                    ) + 1;
                  const correctOption = question.question_options.find(
                    (option) => option.is_correct,
                  );

                  return (
                    <article
                      key={question.id}
                      className="rounded border border-border bg-secondary-bg p-5"
                    >
                      <div className="mb-3 flex items-start justify-between gap-4">
                        <h3 className="text-sm font-semibold text-primary-text">
                          Question # {questionNumber}
                        </h3>
                        <div className="flex shrink-0 items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              paesQuestionListModal.handleOpenEditQuestionModal(question)
                            }
                            className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-secondary-text hover:text-primary-accent"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              paesQuestionListModal.handleOpenDeleteConfirmation(question)
                            }
                            className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-secondary-text hover:text-error"
                          >
                            <TrashIcon className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </div>

                      <p className="whitespace-pre-wrap text-sm leading-5 text-primary-text">
                        {question.question_text}
                      </p>

                      <div className="mt-5">
                        <p className="mb-2 text-sm font-semibold text-primary-text">
                          Answer:
                        </p>
                        {correctOption ? (
                          <div className="rounded border border-primary-accent bg-[#E0F2F1] px-3 py-2 text-sm font-medium text-primary-accent">
                            <span className="mr-2 font-semibold">
                              {
                                QUESTION_BANK_OPTION_LABELS[
                                  correctOption.sort_order - 1
                                ]
                              }
                              .
                            </span>
                            {correctOption.option_text}
                          </div>
                        ) : (
                          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                            No correct answer selected.
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="rounded border border-border bg-secondary-bg p-5 text-sm text-secondary-text">
                  {paesQuestionListModal.searchQuery.trim()
                    ? "No questions match your search."
                    : "No questions yet."}
                </div>
              )}
            </div>
          )}

          {!paesQuestionListModal.isLoadingQuestions && !paesQuestionListModal.questionsError && (
            <QuestionListPagination
              currentPage={paesQuestionListModal.currentPage}
              firstQuestionNumber={paesQuestionListModal.firstQuestionNumber}
              lastQuestionNumber={paesQuestionListModal.lastQuestionNumber}
              onPageChange={paesQuestionListModal.handlePageChange}
              totalQuestions={paesQuestionListModal.filteredQuestionCount}
              totalPages={paesQuestionListModal.totalPages}
            />
          )}
        </div>
      </div>

      {/* Modals Section */}
      <PaesQuestionFormModal
        key={paesQuestionListModal.questionFormRequest?.requestId ?? "paes-question-form-modal"}
        isSubjectLocked
        onClose={paesQuestionListModal.handleCloseQuestionFormModal}
        onSaved={async () => {
          if (subject) {
            await paesQuestionListModal.loadPaesSubjectQuestions(subject.id);
          }
        }}
        request={paesQuestionListModal.questionFormRequest}
        showSuccessMessage={showSuccessMessage}
        subjects={subjects}
      />

      <DeleteQuestionConfirmationModal
        key={
          paesQuestionListModal.selectedDeleteQuestion?.id ??
          "delete-paes-question-confirmation-modal"
        }
        loadSubjectQuestions={paesQuestionListModal.loadPaesSubjectQuestions}
        onClose={paesQuestionListModal.handleCloseDeleteConfirmation}
        question={paesQuestionListModal.selectedDeleteQuestion}
        questionNumber={
          paesQuestionListModal.selectedDeleteQuestion
            ? paesQuestionListModal.questions.findIndex(
                (question) =>
                  question.id ===
                  paesQuestionListModal.selectedDeleteQuestion!.id,
              ) + 1
            : 0
        }
        selectedSubject={subject}
        showSuccessMessage={showSuccessMessage}
      />
    </>
  );
}
