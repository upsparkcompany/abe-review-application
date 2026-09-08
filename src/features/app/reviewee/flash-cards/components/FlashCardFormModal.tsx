import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { LoaderCircle } from "lucide-react";
import {
  type FlashCardFormModalRequest,
  useFlashCardFormModal,
} from "@/features/app/reviewee/flash-cards/hooks/modals/useFlashCardFormModal";
import type { FlashCardDeck } from "@/features/app/reviewee/flash-cards/types/flashCard";
import { useModalAnimation } from "@/hooks/useModalAnimation";

type FlashCardFormModalProps = {
  flashCardDecks: FlashCardDeck[];
  loadFlashCardDecks: () => Promise<void>;
  onClose: () => void;
  request: FlashCardFormModalRequest | null;
  showSuccessMessage: (message: string) => void;
};

export default function FlashCardFormModal({
  flashCardDecks,
  loadFlashCardDecks,
  onClose,
  request,
  showSuccessMessage,
}: FlashCardFormModalProps) {
  const flashCardFormModal = useFlashCardFormModal({
    flashCardDecks,
    loadFlashCardDecks,
    onClose,
    request,
    showSuccessMessage,
  });
  const modalAnimation = useModalAnimation(flashCardFormModal.isOpen);
  const modalTitle = flashCardFormModal.isEditMode
    ? "Edit Flash Card"
    : "Create Flash Card";

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto px-4 py-6 transition-opacity duration-300 ${
        modalAnimation.isModalVisible
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="flash-card-form-modal-title"
      aria-hidden={!modalAnimation.isModalVisible}
    >
      <div
        className="absolute inset-0 bg-slate-950/35"
        onClick={() => modalAnimation.closeWithAnimation(flashCardFormModal.handleClose)}
      ></div>

      <div
        ref={flashCardFormModal.dialogRef}
        tabIndex={-1}
        className={`relative max-h-[calc(100dvh-3rem)] w-full max-w-[525px] overflow-y-auto rounded-md bg-surface px-6 py-8 shadow-xl transition-all duration-300 ease-out sm:px-9 sm:py-10 ${
          modalAnimation.isModalVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "-translate-y-4 scale-95 opacity-0"
        }`}
      >
        <div className="mb-8 flex items-center justify-between gap-4">
          <h2
            id="flash-card-form-modal-title"
            className="text-xl font-semibold text-primary-text"
          >
            {modalTitle}
          </h2>
          <button
            type="button"
            onClick={() => modalAnimation.closeWithAnimation(flashCardFormModal.handleClose)}
            disabled={flashCardFormModal.isSaving}
            className="cursor-pointer rounded text-secondary-text transition-colors hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`Close ${modalTitle.toLowerCase()} modal`}
          >
            <XMarkIcon className="h-7 w-7" />
          </button>
        </div>

        <form onSubmit={flashCardFormModal.handleSaveFlashCard} className="space-y-5">
          <label
            htmlFor="flash-card-area"
            className="block text-sm font-semibold text-primary-text"
          >
            Area
            <span className="relative mt-2 block">
              <select
                id="flash-card-area"
                value={flashCardFormModal.areaId ?? ""}
                onChange={flashCardFormModal.handleAreaChange}
                disabled={request?.lockArea || flashCardFormModal.isEditMode || flashCardFormModal.isSaving}
                required
                className="h-[50px] w-full appearance-none rounded border border-border bg-surface px-4 pr-11 text-base font-medium text-slate-800 outline-none focus:border-primary-accent focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-secondary-bg disabled:text-secondary-text"
              >
                {flashCardDecks.length === 0 && (
                  <option value="">No areas available</option>
                )}
                {flashCardDecks.map((flashCardDeck) => (
                  <option
                    key={flashCardDeck.areaId}
                    value={flashCardDeck.areaId}
                  >
                    {flashCardDeck.areaName}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-secondary-text" />
            </span>
          </label>

          <label
            htmlFor="flash-card-question"
            className="block text-sm font-semibold text-primary-text"
          >
            Question
            <textarea
              id="flash-card-question"
              value={flashCardFormModal.question}
              onChange={(event) => flashCardFormModal.setQuestion(event.target.value)}
              disabled={flashCardFormModal.isSaving}
              required
              rows={4}
              maxLength={2000}
              placeholder="Enter your question"
              className="mt-2 w-full resize-none rounded border border-border px-4 py-3 text-base font-normal text-primary-text outline-none placeholder:text-slate-400 focus:border-primary-accent focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-secondary-bg"
            />
          </label>

          <label
            htmlFor="flash-card-answer"
            className="block text-sm font-semibold text-primary-text"
          >
            Answer
            <textarea
              id="flash-card-answer"
              value={flashCardFormModal.answer}
              onChange={(event) => flashCardFormModal.setAnswer(event.target.value)}
              disabled={flashCardFormModal.isSaving}
              required
              rows={4}
              maxLength={1000}
              placeholder="Enter the answer"
              className="mt-2 w-full resize-none rounded border border-border px-4 py-3 text-base font-normal text-primary-text outline-none placeholder:text-slate-400 focus:border-primary-accent focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-secondary-bg"
            />
          </label>

          {flashCardFormModal.formError && (
            <p role="alert" className="text-sm text-error">
              {flashCardFormModal.formError}
            </p>
          )}

          <button
            type="submit"
            disabled={flashCardFormModal.isSaving || flashCardDecks.length === 0}
            className="flex h-[50px] w-full cursor-pointer items-center justify-center rounded bg-primary-accent px-5 text-base font-semibold text-surface transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {flashCardFormModal.isSaving ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : flashCardFormModal.isEditMode ? (
              "Save Flash Card"
            ) : (
              "Create Flash Card"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
