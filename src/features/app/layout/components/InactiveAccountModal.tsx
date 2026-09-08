"use client";

import { useInactiveAccountModal } from "@/features/app/layout/hooks/modals/useInactiveAccountModal";
import {
  ArrowRightStartOnRectangleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

type InactiveAccountModalProps = {
  isOpen: boolean;
};

export default function InactiveAccountModal({
  isOpen,
}: InactiveAccountModalProps) {
  const inactiveAccountModal = useInactiveAccountModal(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 px-5 py-8 backdrop-blur-md">
      <div
        ref={inactiveAccountModal.dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="inactive-account-title"
        aria-describedby="inactive-account-description"
        className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-6 text-center shadow-2xl outline-none sm:p-8"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <ExclamationTriangleIcon className="h-9 w-9" aria-hidden="true" />
        </div>

        <h1
          id="inactive-account-title"
          className="mt-5 text-2xl font-semibold text-primary-text"
        >
          Account deactivated
        </h1>
        <div
          id="inactive-account-description"
          className="mt-3 space-y-3 text-sm leading-6 text-secondary-text sm:text-base"
        >
          <p>
            Your access to ABEquip has been temporarily disabled by an
            administrator.
          </p>
          <p>
            You cannot view learning content or use account features while
            your account is inactive. Please contact your administrator if you
            believe this was a mistake or need more information.
          </p>
        </div>

        {inactiveAccountModal.logoutError ? (
          <p role="alert" className="mt-4 text-sm text-error">
            {inactiveAccountModal.logoutError}
          </p>
        ) : null}

        <button
          ref={inactiveAccountModal.logoutButtonRef}
          type="button"
          onClick={inactiveAccountModal.handleLogout}
          disabled={inactiveAccountModal.isLoggingOut}
          className="mt-6 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded bg-primary-accent px-4 text-sm font-medium text-surface transition-colors hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
          {inactiveAccountModal.isLoggingOut ? "Logging out..." : "Log out"}
        </button>
      </div>
    </div>
  );
}
