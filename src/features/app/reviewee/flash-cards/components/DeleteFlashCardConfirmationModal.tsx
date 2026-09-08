import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import { useDeleteFlashCardConfirmationModal } from "@/features/app/reviewee/flash-cards/hooks/modals/useDeleteFlashCardConfirmationModal";
import type { FlashCard } from "@/features/app/reviewee/flash-cards/types/flashCard";
import { useModalAnimation } from "@/hooks/useModalAnimation";

type DeleteFlashCardConfirmationModalProps = {
  flashCard: FlashCard | null;
  loadFlashCardDecks: () => Promise<void>;
  onClose: () => void;
  showSuccessMessage: (message: string) => void;
};

export default function DeleteFlashCardConfirmationModal({
  flashCard,
  loadFlashCardDecks,
  onClose,
  showSuccessMessage,
}: DeleteFlashCardConfirmationModalProps) {
  const deleteFlashCardConfirmationModal = useDeleteFlashCardConfirmationModal({
    flashCard,
    loadFlashCardDecks,
    onClose,
    showSuccessMessage,
  });
  const modalAnimation = useModalAnimation(
    flashCard !== null,
  );

  return (
    <div
      className={`fixed inset-0 z-[80] flex items-center justify-center px-4 transition-opacity duration-300 ${
        modalAnimation.isModalVisible
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-flash-card-modal-title"
      aria-describedby="delete-flash-card-modal-description"
      aria-hidden={!modalAnimation.isModalVisible}
    >
      <div
        className="absolute inset-0 bg-slate-950/40"
        onClick={() => {
          if (!deleteFlashCardConfirmationModal.isDeleting) {
            modalAnimation.closeWithAnimation(onClose);
          }
        }}
      ></div>

      <form
        ref={deleteFlashCardConfirmationModal.dialogRef}
        onSubmit={deleteFlashCardConfirmationModal.handleDeleteFlashCard}
        className={`relative max-h-[calc(100dvh-2rem)] w-full max-w-[580px] overflow-y-auto rounded-md bg-surface px-6 py-9 shadow-xl transition-all duration-300 ease-out sm:px-10 sm:py-10 ${
          modalAnimation.isModalVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "-translate-y-4 scale-95 opacity-0"
        }`}
      >
        <div>
          <h2
            id="delete-flash-card-modal-title"
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
            Flash Card Deletion Notice
          </h2>
          <p
            id="delete-flash-card-modal-description"
            className="mt-7 text-base leading-6 text-secondary-text"
          >
            Are you sure you want to delete this flash card? This action cannot
            be undone.
          </p>
        </div>

        {flashCard && (
          <div className="mt-6">
            <p className="mb-2 text-base font-medium text-primary-text">
              Flash Card #
            </p>
            <div className="min-h-32 rounded border border-border bg-secondary-bg p-4 sm:min-h-36">
              <p className="line-clamp-5 text-sm font-medium leading-6 text-primary-text">
                {flashCard.question}
              </p>
            </div>
          </div>
        )}

        {deleteFlashCardConfirmationModal.deleteError && (
          <p role="alert" className="mt-4 text-sm text-error">
            {deleteFlashCardConfirmationModal.deleteError}
          </p>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="submit"
            disabled={deleteFlashCardConfirmationModal.isDeleting}
            className="flex h-12 cursor-pointer items-center justify-center rounded bg-primary-accent text-base font-semibold text-surface transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {deleteFlashCardConfirmationModal.isDeleting ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : (
              "Yes, Continue"
            )}
          </button>
          <button
            ref={deleteFlashCardConfirmationModal.cancelButtonRef}
            type="button"
            onClick={() => modalAnimation.closeWithAnimation(onClose)}
            disabled={deleteFlashCardConfirmationModal.isDeleting}
            className="h-12 cursor-pointer rounded border border-primary-accent bg-surface text-base font-semibold text-primary-accent transition-colors hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light disabled:cursor-not-allowed disabled:opacity-50"
          >
            No, Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
