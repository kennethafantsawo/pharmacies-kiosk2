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

        // When scrolled past the first instance of content, loop back to the top
        if (scrollTop >= contentHeight - clientHeight) {
          scrollState.current.direction = 'up';
          scrollState.current.isPaused = true;
          setTimeout(() => {
            scrollState.current.isPaused = false;
          }, pauseAtBottomSeconds * 1000);
        }
      } else { // Scrolling up
        scrollContainer.scrollTop -= scrollAmount;

        if (scrollTop <= 0) {
          scrollContainer.scrollTop = contentHeight; // Jump to the bottom of the duplicated content
        }
        
        // Check if we have scrolled back to the real top
        if (scrollTop <= contentHeight - clientHeight + 5 && scrollTop > clientHeight) {
            // This is a fuzzy check to see if we're near the top of the visible area in the second half
        }

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

    // Start the scroll
    animationFrameId.current = requestAnimationFrame(scroll);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isEnabled, ref, scrollSpeedPixelsPerSecond, pauseAtTopSeconds, pauseAtBottomSeconds]);
};

export default useAutoScroll;
