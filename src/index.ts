import { useDeferredValue, useEffect, useLayoutEffect, useRef } from "react";

export type UseDebugConcurrentParameters = {
  /**
   * Runs when the first render starts.
   *
   * The first render may either be
   * a low priority render or a high
   * priority render, but this cannot
   * be inferred from the inside,
   * only from the outside.
   */
  onFirstRenderStart?: () => void;

  /**
   * Runs when the first render ends.
   */
  onFirstRenderEnd?: () => void;

  /**
   * Runs when a low priority render starts.
   */
  onLowPriorityStart?: () => void;

  /**
   * Runs when a low priority render ends.
   */
  onLowPriorityEnd?: () => void;

  /**
   * Runs when a high priority render starts.
   *
   * When a high prioirity render starts
   * before a previously started low priority
   * has the chance to end, this means
   * that the low priority render was
   * interrupted.
   */
  onHighPriorityStart?: () => void;

  /**
   * Runs when a high priority render ends.
   */
  onHighPriorityEnd?: () => void;
};

/**
 * Used to debug React's concurrent features,
 * more specifically, it allows you to
 * attach callbacks to the lifecycle of
 * low priority and high priority renders.
 *
 * To make your results as accurate as possible,
 * make sure this hook is the first hook in your
 * component.
 */
export const useDebugConcurrent = ({
  onFirstRenderStart,
  onFirstRenderEnd,
  onLowPriorityStart,
  onLowPriorityEnd,
  onHighPriorityStart,
  onHighPriorityEnd,
}: UseDebugConcurrentParameters) => {
  // We use a deferred value to determine
  // whether the current render is a low
  // priority render or not.

  // As the probe is created on the render
  // the object we create has always a new
  // reference, which means that the deferred
  // value will always be different from the
  // previous render.
  const probe = {};
  const deferredProbe = useDeferredValue(probe);
  const isFirstRenderRef = useRef(true);
  const isFirstRender = isFirstRenderRef.current;

  const isLowPriority = probe === deferredProbe;

  if (isFirstRender) {
    isFirstRenderRef.current = false;
    onFirstRenderStart?.();
  } else {
    if (isLowPriority) {
      onLowPriorityStart?.();
    } else {
      onHighPriorityStart?.();
    }
  }

  useIsomorphicLayoutEffect(() => {
    // We consider not only the render
    // of the component itself, but the render
    // of the whole component sub-tree.

    // This way, when effects run, we know
    // that the whole component sub-tree
    // has been rendered.

    if (isFirstRender) {
      onFirstRenderEnd?.();
    } else {
      if (isLowPriority) {
        onLowPriorityEnd?.();
      } else {
        onHighPriorityEnd?.();
      }
    }
  });
};

const isServer = typeof window === "undefined";

const useIsomorphicLayoutEffect = isServer ? useEffect : useLayoutEffect;
