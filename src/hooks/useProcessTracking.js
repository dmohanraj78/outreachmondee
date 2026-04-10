import { useProcess } from '../context/ProcessContext';

/**
 * useProcessTracking
 * A refactored hook that now points to the Global ProcessContext.
 * Ensures all components share the same processing state.
 */
export const useProcessTracking = () => {
  const process = useProcess();
  
  if (!process) {
    throw new Error("useProcessTracking must be used within a ProcessProvider");
  }

  return {
    startProcess: process.startProcess,
    completeProcess: process.completeProcess,
    failProcess: process.failProcess,
    reset: process.close,
    modalProps: {
      isOpen: process.isOpen,
      isMinimized: process.isMinimized,
      status: process.status,
      title: process.title,
      message: process.message,
      percentage: process.percentage,
      error: process.error,
      currentNode: process.currentNode,
      onClose: process.close,
      onMinimize: process.toggleMinimize
    }
  };
};
