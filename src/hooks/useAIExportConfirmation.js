import { useState } from 'react';

/**
 * Hook to manage AI export confirmation state
 */
export function useAIExportConfirmation() {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [exportType, setExportType] = useState('export');
  const [contentType, setContentType] = useState('AI-generated content');

  const requestExport = (action, type = 'export', content = 'AI-generated content') => {
    setPendingAction(() => action);
    setExportType(type);
    setContentType(content);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    if (pendingAction) {
      pendingAction();
    }
    setIsOpen(false);
    setPendingAction(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setPendingAction(null);
  };

  return {
    isOpen,
    exportType,
    contentType,
    requestExport,
    handleConfirm,
    handleClose
  };
}
