"use client";

import { useSessionExpiredModal } from "@/features/app/layout/hooks/modals/useSessionExpiredModal";
import { ClockIcon } from "@heroicons/react/24/outline";

type SessionExpiredModalProps = {
  isOpen: boolean;
};

export default function SessionExpiredModal({
  isOpen,
}: SessionExpiredModalProps) {
  useSessionExpiredModal(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 px-5 py-8 backdrop-blur-md">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="session-expired-title"
        aria-describedby="session-expired-description"
        autoFocus
        tabIndex={-1}
        className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 text-center shadow-2xl outline-none sm:p-8"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <ClockIcon className="h-9 w-9" aria-hidden="true" />
        </div>

        <h1
          id="session-expired-title"
          className="mt-5 text-2xl font-semibold text-primary-text"
        >
          Session expired
        </h1>
        <p
          id="session-expired-description"
          className="mt-3 text-sm leading-6 text-secondary-text sm:text-base"
        >
          Your session is no longer valid. Please log in again to continue
          using ABEquip.
        </p>
      </div>
    </div>
  );
}
