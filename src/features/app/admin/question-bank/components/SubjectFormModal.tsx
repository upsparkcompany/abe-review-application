import { LoaderCircle } from "lucide-react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  type AdminSubject,
  type AdminSubjectArea,
} from "@/features/app/admin/question-bank/actions/fetch-subject-areas.action";
import { useSubjectFormModal } from "@/features/app/admin/question-bank/hooks/modals/useSubjectFormModal";
import { useModalAnimation } from "@/hooks/useModalAnimation";

type SubjectFormModalProps = {
  areaId: number | null;
  loadSubjectAreas: () => Promise<void>;
  onClose: () => void;
  onEditSuccess: () => void;
  showSuccessMessage: (message: string) => void;
  subject: AdminSubject | null;
  subjectAreas: AdminSubjectArea[];
};

export default function SubjectFormModal({
  areaId,
  loadSubjectAreas,
  onClose,
  onEditSuccess,
  showSuccessMessage,
  subject,
  subjectAreas,
}: SubjectFormModalProps) {
  const subjectFormModal = useSubjectFormModal({
    areaId,
    loadSubjectAreas,
    onClose,
    onEditSuccess,
    showSuccessMessage,
    subject,
    subjectAreas,
  });
  const modalAnimation = useModalAnimation(
    subjectFormModal.openSubjectFormModal,
  );

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-opacity duration-300 ${
        modalAnimation.isModalVisible
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="subject-form-modal-title"
      aria-hidden={!modalAnimation.isModalVisible}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-slate-950/30"
        onClick={() => {
          if (!subjectFormModal.isSavingSubject) {
            modalAnimation.closeWithAnimation(subjectFormModal.handleCloseSubjectFormModal);
          }
        }}
        aria-label="Close subject form"
        tabIndex={-1}
      />

      <div
        ref={subjectFormModal.dialogRef}
        tabIndex={-1}
        className={`relative max-h-[calc(100dvh-2rem)] w-full max-w-[525px] overflow-y-auto rounded-md bg-surface p-9 shadow-xl transition-all duration-300 ease-out ${
          modalAnimation.isModalVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "-translate-y-4 scale-95 opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={() => modalAnimation.closeWithAnimation(subjectFormModal.handleCloseSubjectFormModal)}
          disabled={subjectFormModal.isSavingSubject}
          className="absolute top-9 right-9 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Close subject form"
        >
          <XMarkIcon className="h-7 w-7 text-secondary-text" />
        </button>

        <h2
          id="subject-form-modal-title"
          className="mb-8 text-xl font-semibold text-primary-text"
        >
          {subjectFormModal.isEditing ? "Edit Subject" : "Add New Subject"}
        </h2>

        <form onSubmit={subjectFormModal.handleSaveSubject} className="flex flex-col gap-5">
          <input type="hidden" name="areaId" value={subjectFormModal.subjectFormData.areaId} />
          <input type="hidden" name="subjectId" value={subject?.id ?? ""} />

          <div className="flex flex-col gap-2">
            <label htmlFor="selectedArea" className="text-sm font-semibold">
              Area
            </label>
            <input
              id="selectedArea"
              type="text"
              value={subjectFormModal.selectedSubjectAreaName}
              readOnly
              className="h-[50px] w-full cursor-default rounded border border-border bg-secondary-bg px-5 text-base font-medium text-slate-700 outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="subjectName" className="text-sm font-semibold">
              Subject Name
            </label>
            <input
              id="subjectName"
              name="subjectName"
              type="text"
              value={subjectFormModal.subjectFormData.subjectName}
              onChange={subjectFormModal.handleSubjectInput}
              required
              maxLength={255}
              className="h-[50px] w-full rounded border border-border px-5 text-base text-primary-text outline-none focus:border-primary-accent"
            />
          </div>

          <p className="text-xs text-secondary-text">
            {subjectFormModal.isEditing
              ? "✓ Existing questions will stay linked to this subject"
              : "✓ You can add questions to this subject after creating it"}
          </p>

          <button
            type="submit"
            disabled={subjectFormModal.isSavingSubject}
            className="flex h-[50px] cursor-pointer items-center justify-center rounded bg-primary-accent px-5 text-base font-semibold text-surface transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {subjectFormModal.isSavingSubject ? (
              <LoaderCircle className="animate-spin" aria-label="Saving" />
            ) : subjectFormModal.isEditing ? (
              "Save Changes"
            ) : (
              "Create Subject"
            )}
          </button>

          {subjectFormModal.error && (
            <p role="alert" className="text-sm text-error">
              {subjectFormModal.error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
