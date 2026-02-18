"use client";

import { useEffect, useRef, useCallback } from 'react';

interface AutoScrollProps {
  ref: React.RefObject<HTMLElement>;
  isEnabled: boolean;
  scrollTopPauseSeconds: number;
  scrollBottomPauseSeconds: number;
  scrollSpeed: number;
}

const useAutoScroll = ({
  ref,
  isEnabled,
  scrollTopPauseSeconds,
  scrollBottomPauseSeconds,
  scrollSpeed,
}: AutoScrollProps) => {
  const animationFrameId = useRef<number | null>(null);
  const scrollDirection = useRef<'down' | 'up'>('down');
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  const cleanUp = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
  }, []);

  useEffect(() => {
    if (!isEnabled || !ref.current) {
      cleanUp();
      return;
    }

    const element = ref.current;

    const scroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      const contentHeight = scrollHeight / 2; // We have duplicated content
      const maxScroll = contentHeight - clientHeight;

      if (scrollDirection.current === 'down') {
        element.scrollTop += scrollSpeed;
        if (element.scrollTop >= maxScroll) {
          // Pause at the bottom
          cleanUp();
          timeoutId.current = setTimeout(() => {
            scrollDirection.current = 'up';
            animationFrameId.current = requestAnimationFrame(scroll);
          }, scrollBottomPauseSeconds * 1000);
        } else {
          animationFrameId.current = requestAnimationFrame(scroll);
        }
      } else { // 'up'
        element.scrollTop -= scrollSpeed;
        if (element.scrollTop <= 0) {
           // Reset to the top of the cloned content to create a seamless loop
          element.scrollTop = contentHeight;
          scrollDirection.current = 'down'; // Change direction for next effective scroll
           // Pause at the top
          cleanUp();
          timeoutId.current = setTimeout(() => {
            animationFrameId.current = requestAnimationFrame(scroll);
          }, scrollTopPauseSeconds * 1000);
        } else {
          animationFrameId.current = requestAnimationFrame(scroll);
        }
      }
    };
    
    // Start scrolling after a brief initial pause
    timeoutId.current = setTimeout(() => {
        animationFrameId.current = requestAnimationFrame(scroll);
    }, scrollTopPauseSeconds * 1000);


    return () => cleanUp();
  }, [isEnabled, ref, scrollBottomPauseSeconds, scrollTopPauseSeconds, scrollSpeed, cleanUp]);
};

export default useAutoScroll;
