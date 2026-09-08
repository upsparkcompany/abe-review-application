import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { LoaderCircle } from "lucide-react";
import { DeactivateRevieweeConfirmationModal } from "@/features/app/admin/manage-reviewees/components/DeactivateRevieweeConfirmationModal";
import { useUserFormModal } from "@/features/app/admin/manage-reviewees/hooks/modals/useUserFormModal";
import type { Reviewee } from "@/features/app/admin/manage-reviewees/types/reviewee";

type UserFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (message: string) => Promise<void>;
  reviewee: Reviewee | null;
};

const formatStatus = (status: string) =>
  status.charAt(0).toUpperCase() + status.slice(1);

export const UserFormModal = (props: UserFormModalProps) => {
  const modal = useUserFormModal(props);
  const modalTitle = modal.isEditing ? "Edit Reviewee" : "Register User";

  return (
    <>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 transition-opacity duration-300 ${
          props.isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onMouseDown={(event) => {
          if (
            event.target === event.currentTarget &&
            !modal.isSubmitting &&
            !modal.isDeactivationConfirmationOpen
          ) {
            props.onClose();
          }
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-form-title"
        aria-hidden={!props.isOpen || modal.isDeactivationConfirmationOpen}
        inert={!props.isOpen || modal.isDeactivationConfirmationOpen}
      >
        <div
          ref={modal.dialogRef}
          tabIndex={-1}
          className={`relative max-h-[calc(100dvh-3rem)] w-full max-w-[525px] overflow-hidden rounded-lg bg-surface shadow-xl transition-all duration-300 sm:overflow-y-auto sm:px-9 sm:py-10 ${
            props.isOpen ? "translate-y-0 scale-100" : "-translate-y-3 scale-95"
          }`}
        >
          <div className="max-h-[calc(100vh-3rem)] overflow-y-auto px-6 pt-8 pb-28 sm:contents">
            <div className="mb-8 flex items-center justify-between">
              <h2
                id="user-form-title"
                className="text-xl font-semibold text-primary-text"
              >
                {modalTitle}
              </h2>
              <button
                type="button"
                onClick={props.onClose}
                disabled={modal.isSubmitting}
                className="cursor-pointer text-secondary-text hover:text-slate-800"
                aria-label={`Close ${modalTitle.toLowerCase()} modal`}
              >
                <XMarkIcon className="h-7 w-7" />
              </button>
            </div>

            <form
              id="user-form"
              onSubmit={modal.handleSubmit}
              className="space-y-5"
            >
              <label className="block text-base font-medium text-primary-text">
                Full Name
                <input
                  type="text"
                  value={modal.fullName}
                  onChange={(event) => modal.setFullName(event.target.value)}
                  autoComplete="name"
                  className="mt-2 h-[50px] w-full rounded border border-border px-4 outline-none focus:border-primary-light focus:ring-2 focus:ring-teal-100"
                />
              </label>

              <label className="block text-base font-medium text-primary-text">
                Email Address
                <input
                  type="email"
                  value={modal.email}
                  onChange={(event) => modal.setEmail(event.target.value)}
                  readOnly={modal.isEditing}
                  autoComplete="email"
                  className={`mt-2 h-[50px] w-full rounded border border-border px-4 outline-none ${
                    modal.isEditing
                      ? "cursor-not-allowed bg-secondary-bg text-secondary-text"
                      : "focus:border-primary-light focus:ring-2 focus:ring-teal-100"
                  }`}
                />
              </label>

              {modal.isEditing && props.reviewee && (
                <div>
                  <p className="text-base font-medium text-primary-text">
                    Status
                  </p>
                  <div className="mt-2 flex min-h-[50px] items-center justify-between rounded border border-border bg-secondary-bg px-4">
                    <span className="text-primary-text">
                      {formatStatus(modal.status)}
                    </span>
                    {["active", "inactive"].includes(
                      props.reviewee.status.toLowerCase(),
                    ) && (
                      <button
                        ref={modal.statusSwitchRef}
                        type="button"
                        role="switch"
                        aria-checked={modal.status === "active"}
                        onClick={modal.handleStatusToggle}
                        disabled={modal.isSubmitting}
                        className={`relative h-6 w-11 cursor-pointer rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2 ${
                          modal.status === "active"
                            ? "bg-primary-accent"
                            : "bg-slate-300"
                        }`}
                        aria-label="Active reviewee status"
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-surface shadow transition-transform ${
                            modal.status === "active"
                              ? "translate-x-5"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    )}
                  </div>
                  {["active", "inactive"].includes(
                    props.reviewee.status.toLowerCase(),
                  ) && (
                    <p className="mt-2 text-xs text-secondary-text">
                      {modal.status === "active"
                        ? "Turn off the switch to deactivate this reviewee."
                        : "Turn on the switch to activate this reviewee."}
                    </p>
                  )}
                </div>
              )}

              <label className="block text-base font-medium text-primary-text">
                Mode of Review
                <span className="relative mt-2 block">
                  <select
                    value={modal.modeOfReview}
                    onChange={(event) =>
                      modal.setModeOfReview(event.target.value)
                    }
                    className="h-[50px] w-full appearance-none rounded border border-border bg-surface px-4 pr-11 outline-none focus:border-primary-light focus:ring-2 focus:ring-teal-100"
                  >
                    <option value="online">Online</option>
                    <option value="in-house">In-House</option>
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary-text" />
                </span>
              </label>

              {modal.error && (
                <p role="alert" className="text-sm text-error">
                  {modal.error}
                </p>
              )}
              <button
                type="submit"
                disabled={modal.isSubmitting}
                className="hidden h-[50px] w-full cursor-pointer items-center justify-center rounded bg-primary-accent font-medium text-surface hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60 sm:flex"
              >
                {modal.isSubmitting ? (
                  <LoaderCircle
                    className="h-5 w-5 animate-spin"
                    aria-label={modal.isEditing ? "Saving" : "Registering"}
                  />
                ) : modal.isEditing ? (
                  "Save Changes"
                ) : (
                  "Register User"
                )}
              </button>
            </form>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-10 bg-surface px-6 pt-3 pb-6 shadow-[0_-8px_18px_rgba(15,23,42,0.08)] sm:hidden">
            <button
              type="submit"
              form="user-form"
              disabled={modal.isSubmitting}
              className="flex h-[50px] w-full cursor-pointer items-center justify-center rounded bg-primary-accent font-medium text-surface hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {modal.isSubmitting ? (
                <LoaderCircle
                  className="h-5 w-5 animate-spin"
                  aria-label={modal.isEditing ? "Saving" : "Registering"}
                />
              ) : modal.isEditing ? (
                "Save Changes"
              ) : (
                "Register User"
              )}
            </button>
          </div>
        </div>
      </div>

      <DeactivateRevieweeConfirmationModal
        isOpen={modal.isDeactivationConfirmationOpen}
        onClose={modal.cancelDeactivation}
        onConfirm={modal.confirmDeactivation}
        returnFocusRef={modal.deactivationReturnFocusRef}
      />
    </>
  );
};
