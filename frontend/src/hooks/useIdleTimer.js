import { useEffect, useRef } from 'react';

/**
 * useIdleTimer monitors user activity (clicks, keypresses, mouse movement, scrolls)
 * and automatically executes `onIdle` after the specified period of inactivity.
 * (OWASP Session Management - Item A7 & A8)
 *
 * @param {Object} options
 * @param {Function} options.onIdle - Callback triggered when user becomes idle
 * @param {number} [options.timeout=1800000] - Inactivity timeout in ms (default: 30 minutes)
 * @param {boolean} [options.enabled=true] - Whether monitoring is enabled
 */
export function useIdleTimer({ onIdle, timeout = 30 * 60 * 1000, enabled = true }) {
  const timeoutIdRef = useRef(null);
  const lastActiveRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      return;
    }

    lastActiveRef.current = Date.now();

    const resetTimer = () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      timeoutIdRef.current = setTimeout(() => {
        if (onIdle) {
          onIdle();
        }
      }, timeout);
    };

    const handleUserActivity = () => {
      const now = Date.now();
      // Throttle reset calls to at most once every 5 seconds to preserve performance
      if (now - lastActiveRef.current > 5000) {
        lastActiveRef.current = now;
        resetTimer();
      }
    };

    // Initialize timer
    resetTimer();

    // Standard DOM user interaction events
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [onIdle, timeout, enabled]);
}

export default useIdleTimer;
