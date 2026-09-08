import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import type { AdminSubject } from "@/features/app/admin/question-bank/actions/fetch-subject-areas.action";
import { useDeleteSubjectConfirmationModal } from "@/features/app/admin/question-bank/hooks/modals/useDeleteSubjectConfirmationModal";
import { useModalAnimation } from "@/hooks/useModalAnimation";

type DeleteSubjectConfirmationModalProps = {
  loadSubjectAreas: () => Promise<void>;
  onClose: () => void;
  onDeleteSuccess: () => void;
  showSuccessMessage: (message: string) => void;
  subject: AdminSubject | null;
};

export default function DeleteSubjectConfirmationModal({
  loadSubjectAreas,
  onClose,
  onDeleteSuccess,
  showSuccessMessage,
  subject,
}: DeleteSubjectConfirmationModalProps) {
  const modalAnimation = useModalAnimation(
    subject !== null,
  );
  const deleteSubjectConfirmationModal = useDeleteSubjectConfirmationModal({
    loadSubjectAreas,
    onClose,
    onDeleteSuccess,
    showSuccessMessage,
    subject,
  });

  return (
    <div
      className={`fixed inset-0 z-[80] flex items-center justify-center px-4 transition-opacity duration-300 ${
        modalAnimation.isModalVisible
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-subject-modal-title"
      aria-describedby="delete-subject-modal-description"
      aria-hidden={!modalAnimation.isModalVisible}
    >
      <button
        type="button"
        onClick={() => {
          if (!deleteSubjectConfirmationModal.isDeleting) {
            modalAnimation.closeWithAnimation(deleteSubjectConfirmationModal.handleCloseDeleteSubjectConfirmation);
          }
        }}
        className="absolute inset-0 cursor-default bg-slate-950/45"
        aria-label="Close delete subject confirmation"
        tabIndex={-1}
      />

      <form
        ref={deleteSubjectConfirmationModal.dialogRef}
        onSubmit={deleteSubjectConfirmationModal.handleDeleteSubject}
        className={`relative max-h-[calc(100dvh-2rem)] w-full max-w-[580px] overflow-y-auto rounded-md bg-surface p-10 shadow-xl transition-all duration-300 ease-out ${
          modalAnimation.isModalVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "-translate-y-4 scale-95 opacity-0"
        }`}
      >
        <div>
          <h2
            id="delete-subject-modal-title"
            className="flex items-center gap-3 text-xl font-semibold text-primary-text"
          >
            <div className="h-7 w-7 flex justify-center items-center">
              <Image
                src="/caution.png"
                alt=""
                width={26}
                height={26}
                className="h-8 w-8 object-cover"
              />
            </div>
            Subject Deletion Notice
          </h2>
          <p
            id="delete-subject-modal-description"
            className="mt-3 text-base leading-6 text-secondary-text"
          >
            Are you sure you want to permanently delete this subject? All
            questions associated with it will also be deleted. This action
            cannot be undone.
          </p>
        </div>

        {subject && (
          <p className="mt-5 flex h-[50px] items-center rounded border border-border bg-secondary-bg px-5 text-base font-medium text-primary-text">
            {subject.name}
          </p>
        )}

        {deleteSubjectConfirmationModal.deleteError && (
          <p role="alert" className="mt-4 text-sm text-error">
            {deleteSubjectConfirmationModal.deleteError}
          </p>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="submit"
            disabled={deleteSubjectConfirmationModal.isDeleting}
            className="flex h-[50px] cursor-pointer items-center justify-center rounded bg-primary-accent text-base font-semibold text-surface transition-colors hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-accent disabled:cursor-not-allowed disabled:opacity-70"
          >
            {deleteSubjectConfirmationModal.isDeleting ? (
              <LoaderCircle
                className="h-5 w-5 animate-spin"
                aria-label="Deleting"
              />
            ) : (
              "Yes, Continue"
            )}
          </button>
          <button
            ref={deleteSubjectConfirmationModal.cancelButtonRef}
            type="button"
            onClick={() =>
              modalAnimation.closeWithAnimation(deleteSubjectConfirmationModal.handleCloseDeleteSubjectConfirmation)
            }
            disabled={deleteSubjectConfirmationModal.isDeleting}
            className="h-[50px] cursor-pointer rounded border border-primary-accent bg-surface text-base font-semibold text-primary-accent transition-colors hover:bg-secondary-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            No, Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
