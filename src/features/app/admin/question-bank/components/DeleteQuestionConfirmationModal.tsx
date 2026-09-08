import type { AdminSubject } from "@/features/app/admin/question-bank/actions/fetch-subject-areas.action";
import type { AdminQuestion } from "@/features/app/admin/question-bank/actions/fetch-subject-question-sets.action";
import { useDeleteQuestionConfirmationModal } from "@/features/app/admin/question-bank/hooks/modals/useDeleteQuestionConfirmationModal";
import { useModalAnimation } from "@/hooks/useModalAnimation";
import Image from "next/image";
import { LoaderCircle } from "lucide-react";
import { XMarkIcon } from "@heroicons/react/24/outline";

type DeleteQuestionConfirmationModalProps = {
  loadSubjectQuestions: (subjectId: number) => Promise<void>;
  onClose: () => void;
  question: AdminQuestion | null;
  questionNumber: number;
  selectedSubject: AdminSubject | null;
  showSuccessMessage: (message: string) => void;
};

export default function DeleteQuestionConfirmationModal({
  loadSubjectQuestions,
  onClose,
  question,
  questionNumber,
  selectedSubject,
  showSuccessMessage,
}: DeleteQuestionConfirmationModalProps) {
  const deleteQuestionConfirmationModal = useDeleteQuestionConfirmationModal({
      loadSubjectQuestions,
      onClose,
      question,
      selectedSubject,
      showSuccessMessage,
    });
  const modalAnimation = useModalAnimation(
    question !== null,
  );

  return (
    <div
      className={`fixed inset-0 z-[80] flex items-center justify-center px-4 transition-opacity duration-300 ${
        modalAnimation.isModalVisible
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
    >
      <div
        className="absolute inset-0 bg-slate-950/35"
        onClick={() => modalAnimation.closeWithAnimation(onClose)}
      ></div>

      <form
        onSubmit={deleteQuestionConfirmationModal.handleDeleteQuestion}
        className={`relative max-h-[calc(100dvh-2rem)] w-full max-w-[580px] overflow-y-auto rounded-md bg-surface p-7 shadow-xl transition-all duration-300 ease-out sm:p-10 ${
          modalAnimation.isModalVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "-translate-y-4 scale-95 opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={() => modalAnimation.closeWithAnimation(onClose)}
          className="absolute top-6 right-6 cursor-pointer rounded text-secondary-text transition-colors hover:text-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-accent"
          aria-label="Close question deletion notice"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <input type="hidden" name="questionId" value={question?.id ?? ""} />
        <input
          type="hidden"
          name="subjectId"
          value={selectedSubject?.id ?? ""}
        />

        <div className="flex items-center gap-3 pr-9">
          <div className="flex h-7 w-7 items-center justify-center">
            <Image
              src="/caution.png"
              alt=""
              width={26}
              height={26}
              className="h-8 w-8 object-cover"
            />
          </div>
          <h2 className="text-xl font-semibold text-primary-text">
            Question Deletion Notice
          </h2>
        </div>

        <div className="mt-7">
          <p className="text-base leading-6 text-secondary-text">
            Are you sure you want to delete this question? This action cannot be
            undone.
          </p>
        </div>

        {question && (
          <div className="mt-6">
            <p className="mb-2 text-base font-medium text-primary-text">
              Question # {questionNumber}
            </p>
            <div className="min-h-36 rounded border border-border bg-secondary-bg p-4">
              <p className="whitespace-pre-wrap text-sm leading-6 text-primary-text">
                {question.question_text}
              </p>
            </div>
          </div>
        )}

        {deleteQuestionConfirmationModal.deleteQuestionError && (
          <p className="mt-4 text-sm text-error">{deleteQuestionConfirmationModal.deleteQuestionError}</p>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="submit"
            disabled={deleteQuestionConfirmationModal.isDeletingQuestion}
            className="flex h-[50px] cursor-pointer items-center justify-center rounded bg-primary-accent text-base font-semibold text-surface transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {deleteQuestionConfirmationModal.isDeletingQuestion ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              "Yes, Continue"
            )}
          </button>
          <button
            type="button"
            onClick={() => modalAnimation.closeWithAnimation(onClose)}
            className="h-[50px] cursor-pointer rounded border border-primary-accent bg-surface text-base font-medium text-primary-accent transition-colors hover:bg-teal-50"
          >
            No, Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
