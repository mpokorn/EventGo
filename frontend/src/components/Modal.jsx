import { useEffect } from "react";
import "../styles/modal.css";

export default function Modal({ isOpen, onClose, onConfirm, title, message, type = "confirm" }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title || "Confirmation"}</h3>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          {type === "confirm" ? (
            <>
              <button className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="btn-primary" onClick={onConfirm}>
                OK
              </button>
            </>
          ) : (
            <button className="btn-primary" onClick={onClose}>
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
