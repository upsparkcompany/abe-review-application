import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchActivityHistoryDetails } from "@/features/app/reviewee/history/actions/fetch-activity-history-details.action";
import type { ActivityHistoryDetails } from "@/features/app/reviewee/history/types/activityHistory";
import { useQuizModalAccessibility } from "@/features/app/reviewee/mcq-quiz/hooks/modals/useQuizModalAccessibility";
import { getGameSummaryPresentation } from "@/features/app/reviewee/utils/getGameSummaryPresentation";

type UseHistoryDetailsModalProps = {
  sessionId: string | null;
  isOpen: boolean;
  onClose: () => void;
};

const HISTORY_DETAILS_PAGE_SIZE = 5;

export const useHistoryDetailsModal = ({
  sessionId,
  isOpen,
  onClose,
}: UseHistoryDetailsModalProps) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const requestIdRef = useRef(0);
  const [details, setDetails] = useState<ActivityHistoryDetails | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const resetDetails = useCallback(() => {
    setDetails(null);
    setError("");
    setIsLoading(false);
    setCurrentPage(1);
  }, []);

  const handleClose = useCallback(() => {
    requestIdRef.current += 1;
    resetDetails();
    onClose();
  }, [onClose, resetDetails]);
  const modalAccessibility = useQuizModalAccessibility({
    initialFocusRef: closeButtonRef,
    isOpen,
    onClose: handleClose,
  });

  const loadDetails = useCallback(async () => {
    if (!isOpen || sessionId === null) return;

    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError("");

    const result = await fetchActivityHistoryDetails({ sessionId });

    if (requestId !== requestIdRef.current) return;

    if (!result.success || !result.details) {
      setDetails(null);
      setError(result.error ?? "Unable to load this activity");
      setIsLoading(false);
      return;
    }

    setDetails(result.details);
    setCurrentPage(1);
    setIsLoading(false);
  }, [sessionId, isOpen]);

  useEffect(() => {
    if (!isOpen || sessionId === null) {
      requestIdRef.current += 1;
      resetDetails();
      return;
    }

    void Promise.resolve().then(loadDetails);

    return () => {
      requestIdRef.current += 1;
    };
  }, [sessionId, isOpen, loadDetails, resetDetails]);

  const totalItemPages = Math.max(
    1,
    Math.ceil((details?.items.length ?? 0) / HISTORY_DETAILS_PAGE_SIZE),
  );
  const activeItemPage = Math.min(currentPage, totalItemPages);
  const paginatedItems = useMemo(() => {
    const firstItemIndex = (activeItemPage - 1) * HISTORY_DETAILS_PAGE_SIZE;
    return details?.items.slice(
      firstItemIndex,
      firstItemIndex + HISTORY_DETAILS_PAGE_SIZE,
    ) ?? [];
  }, [activeItemPage, details?.items]);
  const summaryPresentation = getGameSummaryPresentation(details?.history ?? null);

  return {
    activeItemPage,
    closeButtonRef,
    details,
    error,
    handleClose,
    isLoading,
    loadDetails,
    modalAccessibility,
    paginatedItems,
    setCurrentPage,
    summaryPresentation,
    totalItemPages,
    itemPageSize: HISTORY_DETAILS_PAGE_SIZE,
  };
};
