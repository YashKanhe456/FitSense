import React, { useEffect, useRef } from 'react';

function ConfirmDialog({ open, title, description, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, loading = false }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousActiveElement = document.activeElement;
    const dialogNode = dialogRef.current;
    const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    dialogNode?.querySelector('button:not([disabled])')?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
        return;
      }

      if (event.key !== 'Tab' || !dialogNode) {
        return;
      }

      const focusableElements = [...dialogNode.querySelectorAll(focusableSelector)];
      if (focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousActiveElement?.focus?.();
    };
  }, [onCancel, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="confirm-dialog__backdrop" role="dialog" aria-modal="true">
      <div className="confirm-dialog" ref={dialogRef} aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-description">
        <p className="section-kicker">Please confirm</p>
        <h3 id="confirm-dialog-title">{title}</h3>
        <p id="confirm-dialog-description">{description}</p>
        <div className="confirm-dialog__actions">
          <button type="button" className="ghost-button" onClick={onCancel} disabled={loading}>
            {cancelText}
          </button>
          <button type="button" className="primary-button danger-button" onClick={onConfirm} disabled={loading}>
            {loading ? 'Working…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
