import { XMarkIcon } from "@heroicons/react/24/outline";
import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import { useDeleteTriviaConfirmationModal } from "@/features/app/admin/trivias/hooks/modals/useDeleteTriviaConfirmationModal";
import type { AdminTrivia } from "@/features/app/admin/trivias/types/adminTrivia";
import { useModalAnimation } from "@/hooks/useModalAnimation";

type DeleteTriviaConfirmationModalProps = {
  loadTrivias: () => Promise<void>;
  onClose: () => void;
  onDeleted: () => void;
  showSuccessMessage: (message: string) => void;
  trivia: AdminTrivia | null;
};

export default function DeleteTriviaConfirmationModal({
  loadTrivias,
  onClose,
  onDeleted,
  showSuccessMessage,
  trivia,
}: DeleteTriviaConfirmationModalProps) {
  const modalAnimation = useModalAnimation(
    trivia !== null,
  );
  const deleteTriviaConfirmationModal = useDeleteTriviaConfirmationModal({
    loadTrivias,
    onClose,
    onDeleted,
    showSuccessMessage,
    trivia,
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
      aria-labelledby="delete-trivia-modal-title"
      aria-describedby="delete-trivia-modal-description"
      aria-hidden={!modalAnimation.isModalVisible}
    >
      <button
        type="button"
        onClick={() => {
          if (!deleteTriviaConfirmationModal.isDeleting) modalAnimation.closeWithAnimation(onClose);
        }}
        className="absolute inset-0 cursor-default bg-slate-950/45"
        aria-label="Close delete trivia confirmation"
        tabIndex={-1}
      />

      <form
        ref={deleteTriviaConfirmationModal.dialogRef}
        onSubmit={deleteTriviaConfirmationModal.handleDeleteTrivia}
        className={`relative max-h-[calc(100dvh-2rem)] w-full max-w-[580px] overflow-y-auto rounded-md bg-surface p-7 shadow-xl transition-all duration-300 ease-out sm:p-10 ${
          modalAnimation.isModalVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "-translate-y-4 scale-95 opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={() => modalAnimation.closeWithAnimation(onClose)}
          disabled={deleteTriviaConfirmationModal.isDeleting}
          className="absolute top-6 right-6 cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-accent disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Close delete trivia confirmation"
        >
          <XMarkIcon className="h-6 w-6 text-secondary-text" />
        </button>

        <div className="pr-9">
          <h2
            id="delete-trivia-modal-title"
            className="flex items-center gap-3 text-xl font-semibold text-primary-text"
          >
            <div className="flex h-7 w-7 items-center justify-center">
              <Image
                src="/caution.png"
                alt=""
                width={26}
                height={26}
                className="h-8 w-8 object-cover"
              />
            </div>
            Trivia Deletion Notice
          </h2>
          <p
            id="delete-trivia-modal-description"
            className="mt-7 text-base leading-6 text-secondary-text"
          >
            Are you sure you want to delete this trivia? This action cannot be
            undone.
          </p>
        </div>

        {trivia && (
          <p className="mt-5 line-clamp-3 rounded border border-border bg-secondary-bg p-4 text-sm leading-6 text-primary-text">
            {trivia.content}
          </p>
        )}

        {deleteTriviaConfirmationModal.deleteError && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {deleteTriviaConfirmationModal.deleteError}
          </p>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="submit"
            disabled={deleteTriviaConfirmationModal.isDeleting}
            className="flex h-[50px] cursor-pointer items-center justify-center rounded bg-primary-accent text-base font-semibold text-surface transition-colors hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-accent disabled:cursor-not-allowed disabled:opacity-70"
          >
            {deleteTriviaConfirmationModal.isDeleting ? (
              <LoaderCircle
                className="h-5 w-5 animate-spin"
                aria-label="Deleting"
              />
            ) : (
              "Yes, Continue"
            )}
          </button>
          <button
            ref={deleteTriviaConfirmationModal.cancelButtonRef}
            type="button"
            onClick={() => modalAnimation.closeWithAnimation(onClose)}
            disabled={deleteTriviaConfirmationModal.isDeleting}
            className="h-[50px] cursor-pointer rounded border border-primary-accent bg-surface text-base font-semibold text-primary-accent transition-colors hover:bg-secondary-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            No, Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
