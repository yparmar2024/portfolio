/**
 * Manages error modal display state
 *
 * Provides standardized error modal state management across components.
 * Extracted pattern from Multiplayer, Realms, and Options screens.
 *
 * @returns {Object} Error state and handlers
 * @returns {Object|null} returns.error - Current error object with title and message
 * @returns {Function} returns.showError - Function to display an error modal
 * @returns {Function} returns.hideError - Function to dismiss the error modal
 *
 * @example
 * const { error, showError, hideError } = useErrorModal();
 *
 * const handleAction = () => {
 *   showError({
 *     title: "Action Failed",
 *     message: "Cannot perform this action"
 *   });
 * };
 *
 * {error && (
 *   <ErrorModal
 *     title={error.title}
 *     message={error.message}
 *     on Close={hideError}
 *   />
 * )}
 */
import { useState } from 'react';

const useErrorModal = () => {
  const [error, setError] = useState(null);

  return {
    error,
    showError: setError,
    hideError: () => setError(null)
  };
};

export default useErrorModal;
