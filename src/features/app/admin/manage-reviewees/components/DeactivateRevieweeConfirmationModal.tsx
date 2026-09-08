import { XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import type { RefObject } from "react";
import { useDeactivateRevieweeConfirmationModal } from "@/features/app/admin/manage-reviewees/hooks/modals/useDeactivateRevieweeConfirmationModal";

type DeactivateRevieweeConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  returnFocusRef: RefObject<HTMLElement | null>;
};

export const DeactivateRevieweeConfirmationModal = (
  props: DeactivateRevieweeConfirmationModalProps,
) => {
  const deactivateRevieweeConfirmationModal =
    useDeactivateRevieweeConfirmationModal(props);

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center px-4 transition-opacity duration-300 ${
        props.isOpen
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="deactivate-reviewee-title"
      aria-describedby="deactivate-reviewee-description"
      aria-hidden={!props.isOpen}
    >
      <button
        type="button"
        onClick={deactivateRevieweeConfirmationModal.handleClose}
        className="absolute inset-0 cursor-default bg-slate-950/45"
        aria-label="Close deactivation confirmation"
        tabIndex={-1}
      />

      <div
        ref={deactivateRevieweeConfirmationModal.dialogRef}
        inert={!props.isOpen}
        className={`relative max-h-[calc(100dvh-2rem)] w-full max-w-[580px] overflow-y-auto rounded-md bg-surface p-7 shadow-xl transition-all duration-300 ease-out sm:p-10 ${
          props.isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "-translate-y-4 scale-95 opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={deactivateRevieweeConfirmationModal.handleClose}
          className="absolute top-6 right-6 cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-accent"
          aria-label="Close deactivation confirmation"
        >
          <XMarkIcon className="h-6 w-6 text-secondary-text" />
        </button>

        <div className="pr-9">
          <h2
            id="deactivate-reviewee-title"
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
            Reviewee Deactivation Notice
          </h2>
          <p
            id="deactivate-reviewee-description"
            className="mt-7 text-base leading-6 text-secondary-text"
          >
            Are you sure you want to deactivate this reviewee? Once deactivated,
            this reviewee will no longer be able to access or use their account.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={deactivateRevieweeConfirmationModal.handleConfirm}
            className="h-[50px] cursor-pointer rounded bg-primary-accent text-base font-semibold text-surface transition-colors hover:bg-primary-dark"
          >
            Yes, Continue
          </button>
          <button
            ref={deactivateRevieweeConfirmationModal.cancelButtonRef}
            type="button"
            onClick={deactivateRevieweeConfirmationModal.handleClose}
            className="h-[50px] cursor-pointer rounded border border-primary-accent bg-surface text-base font-semibold text-primary-accent transition-colors hover:bg-secondary-bg"
          >
            No, Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
