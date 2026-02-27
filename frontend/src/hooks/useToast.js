import { useState, useCallback } from "react";

let _id = 0;
let _setToasts = null;

export function useToast() {
  const [toasts, setToasts] = useState([]);
  _setToasts = setToasts;

  const dismiss = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 320);
  }, []);

  return { toasts, dismiss };
}

export function toast(type, message) {
  if (!_setToasts) return;
  const id = ++_id;
  _setToasts((prev) => [...prev, { id, type, message }]);
  setTimeout(() => {
    _setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(
      () => _setToasts((prev) => prev.filter((t) => t.id !== id)),
      320
    );
  }, 4500);
}
