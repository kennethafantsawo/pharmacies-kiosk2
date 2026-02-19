// src/hooks/useAutoScroll.ts
import { useEffect, useRef } from 'react';

interface AutoScrollProps {
  ref: React.RefObject<HTMLElement>;
  isEnabled: boolean;
  scrollSpeedPixelsPerSecond: number;
  pauseAtTopSeconds: number;
  pauseAtBottomSeconds: number;
}

const useAutoScroll = ({
  ref,
  isEnabled,
  scrollSpeedPixelsPerSecond,
  pauseAtTopSeconds,
  pauseAtBottomSeconds,
}: AutoScrollProps) => {
  const animationFrameId = useRef<number | null>(null);
  const scrollState = useRef({
    isPaused: false,
    direction: 'down' as 'down' | 'up',
    lastTimestamp: 0,
  });

  useEffect(() => {
    const scrollContainer = ref.current;
    if (!scrollContainer || !isEnabled) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      return;
    }

    const scroll = (timestamp: number) => {
      if (!scrollState.current.lastTimestamp) {
        scrollState.current.lastTimestamp = timestamp;
        animationFrameId.current = requestAnimationFrame(scroll);
        return;
      }

      const deltaTime = (timestamp - scrollState.current.lastTimestamp) / 1000; // in seconds
      scrollState.current.lastTimestamp = timestamp;

      if (scrollState.current.isPaused) {
        animationFrameId.current = requestAnimationFrame(scroll);
        return;
      }

      const scrollAmount = scrollSpeedPixelsPerSecond * deltaTime;
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const contentHeight = scrollHeight / 2; // Because content is duplicated

      if (scrollState.current.direction === 'down') {
        scrollContainer.scrollTop += scrollAmount;

        // When scrolled past the first instance of content, switch to 'up'
        // This detects the bottom of the scrollable area of the first content block
        if (scrollTop >= contentHeight - clientHeight) {
          scrollState.current.direction = 'up';
          scrollState.current.isPaused = true;
          setTimeout(() => {
            scrollState.current.isPaused = false;
          }, pauseAtBottomSeconds * 1000);
        }
      } else { // Scrolling up
        scrollContainer.scrollTop -= scrollAmount;
        
        // When scrolled back to the real top, pause and switch to 'down'
        if (scrollContainer.scrollTop <= 1) {
            scrollState.current.direction = 'down';
            scrollState.current.isPaused = true;
            setTimeout(() => {
                scrollState.current.isPaused = false;
                scrollContainer.scrollTop = 0;
            }, pauseAtTopSeconds * 1000);
        }
      }

      animationFrameId.current = requestAnimationFrame(scroll);
    };

    // Start the scroll after an initial pause to let content render
    const startTimeout = setTimeout(() => {
        animationFrameId.current = requestAnimationFrame(scroll);
    }, pauseAtTopSeconds * 1000);

    return () => {
      clearTimeout(startTimeout);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isEnabled, ref, scrollSpeedPixelsPerSecond, pauseAtTopSeconds, pauseAtBottomSeconds]);
};

export default useAutoScroll;
