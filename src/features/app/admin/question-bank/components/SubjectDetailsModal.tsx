import type { AdminSubject } from "@/features/app/admin/question-bank/actions/fetch-subject-areas.action";
import QuestionFormModal from "@/features/app/admin/question-bank/components/QuestionFormModal";
import QuestionListModal from "@/features/app/admin/question-bank/components/QuestionListModal";
import SubjectDetailsSkeleton from "@/features/app/admin/question-bank/components/SubjectDetailsSkeleton";
import { useSubjectDetailsModal } from "@/features/app/admin/question-bank/hooks/modals/useSubjectDetailsModal";
import { useModalAnimation } from "@/hooks/useModalAnimation";
import { XMarkIcon } from "@heroicons/react/24/outline";

type SubjectDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  showSuccessMessage: (message: string) => void;
  subject: AdminSubject | null;
};

export default function SubjectDetailsModal({
  open,
  onClose,
  showSuccessMessage,
  subject,
}: SubjectDetailsModalProps) {
  const subjectDetailsModal = useSubjectDetailsModal({
    onClose,
    subject,
  });
  const modalAnimation = useModalAnimation(open);
  const isChildModalOpen = Boolean(
    subjectDetailsModal.questionFormRequest ||
      subjectDetailsModal.questionListRequest,
  );

  return (
    <>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 py-4 transition-opacity duration-300 ${
          modalAnimation.isModalVisible
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!modalAnimation.isModalVisible || isChildModalOpen}
        inert={isChildModalOpen}
      >
        <div
          className="absolute inset-0 bg-slate-950/30"
          onClick={() => modalAnimation.closeWithAnimation(subjectDetailsModal.handleCloseSubjectDetails)}
        ></div>

        <div
          className={`relative max-h-[calc(100dvh-2rem)] w-full max-w-[935px] overflow-y-auto rounded-md bg-surface p-5 shadow-xl transition-all duration-300 ease-out sm:p-10 ${
            modalAnimation.isModalVisible
              ? "translate-y-0 scale-100 opacity-100"
              : "-translate-y-4 scale-95 opacity-0"
          }`}
        >
          <button
            type="button"
            onClick={() => modalAnimation.closeWithAnimation(subjectDetailsModal.handleCloseSubjectDetails)}
            className="absolute top-5 right-5 cursor-pointer sm:top-10 sm:right-9"
            aria-label="Close subject details"
          >
            <XMarkIcon className="h-7 w-7 text-secondary-text" />
          </button>

          <div className="mb-6 border-b border-border pb-6">
            <h2 className="pr-10 text-xl font-semibold text-primary-text">
              {subject?.name}
            </h2>
            <p className="mt-3 text-base text-secondary-text">
              {subjectDetailsModal.selectedSubjectTotalQuestions}{" "}
              {subjectDetailsModal.selectedSubjectTotalQuestions === 1 ? "Question" : "Questions"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => subjectDetailsModal.handleOpenCreateQuestionModal(null)}
            className="mb-5 h-10 w-full cursor-pointer rounded border border-border bg-surface text-sm font-semibold text-primary-text transition-colors hover:border-primary-accent hover:text-primary-accent"
          >
            + Add Question
          </button>

          {subjectDetailsModal.isLoadingQuestionSets ? (
            <SubjectDetailsSkeleton />
          ) : subjectDetailsModal.questionSetsError ? (
            <div className="rounded border border-red-200 bg-red-50 p-5 text-sm text-red-600">
              {subjectDetailsModal.questionSetsError}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {subjectDetailsModal.selectedSubjectSummariesByDifficulty.map((summaryGroup) => (
                <section key={summaryGroup.difficulty}>
                  <h3 className="mb-2 text-sm font-semibold text-primary-text">
                    {summaryGroup.difficulty}
                  </h3>
                  <div className="grid gap-3 md:grid-cols-3">
                    {summaryGroup.summaries.map((summary) => (
                      <div
                        key={`${summary.difficulty}-${summary.gameType}`}
                        className="flex min-h-[135px] flex-col rounded border border-border bg-secondary-bg px-2.5 py-4 text-center"
                      >
                        <h4 className="text-sm font-medium text-primary-text">
                          {summary.gameType}
                        </h4>
                        <p className="mt-3 text-sm font-medium text-primary-accent">
                          {summary.questionCount}
                        </p>
                        <p className="mt-2 text-xs text-secondary-text">Questions</p>

                        {summary.questionCount > 0 && (
                          <div className="mt-2">
                            <button
                              type="button"
                              onClick={() =>
                                subjectDetailsModal.handleOpenQuestionListModal(summary)
                              }
                              className="h-[30px] w-full cursor-pointer rounded bg-primary-accent text-xs font-medium text-surface transition-colors hover:bg-primary-dark"
                            >
                              View Questions
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals Section */}
      <QuestionFormModal
        key={subjectDetailsModal.questionFormRequest?.requestId ?? "question-form-modal"}
        loadSubjectQuestions={subjectDetailsModal.loadSubjectQuestions}
        onClose={subjectDetailsModal.handleCloseQuestionFormModal}
        questionSets={subjectDetailsModal.activeSubjectQuestionSets}
        questionSummaries={subjectDetailsModal.questionSummaries}
        request={subjectDetailsModal.questionFormRequest}
        selectedSubject={subject}
        showSuccessMessage={showSuccessMessage}
      />

      <QuestionListModal
        key={subjectDetailsModal.questionListRequest?.requestId ?? "question-list-modal"}
        isSuspended={subjectDetailsModal.questionFormRequest !== null}
        loadSubjectQuestions={subjectDetailsModal.loadSubjectQuestions}
        onAddQuestion={subjectDetailsModal.handleOpenCreateQuestionFromListModal}
        onClose={subjectDetailsModal.handleCloseQuestionListModal}
        onEditQuestion={subjectDetailsModal.handleOpenEditQuestionModal}
        questionSets={subjectDetailsModal.activeSubjectQuestionSets}
        request={subjectDetailsModal.questionListRequest}
        selectedSubject={subject}
        showSuccessMessage={showSuccessMessage}
      />
    </>
  );
}
