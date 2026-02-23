import { useEffect, useRef } from "./lib.js";

/**
 * Detects when an element enters the viewport using IntersectionObserver.
 * Fires once and then disconnects.
 *
 * @param {object}   [options]
 * @param {number}   [options.threshold=0.1]  - Fraction of the element that must be visible (0–1).
 * @param {Function} [options.onVisible]       - Callback fired when the element enters the viewport.
 * @param {string}   [options.eventName]       - If provided, a CustomEvent with this name is
 *                                               dispatched (bubbles) on the element when visible.
 * @returns {import("preact/hooks").Ref} ref   - Attach this ref to the element you want to observe.
 */
export function useInView({ threshold = 0.4, onVisible, eventName } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (typeof onVisible === "function") onVisible();
          if (eventName) {
            node.dispatchEvent(new CustomEvent(eventName, { bubbles: true }));
          }
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return ref;
}
