import { useState, useEffect } from 'react';

interface UseTypingEffectOptions {
  texts: string[];
  speed?: number;
  pauseTime?: number;
  loop?: boolean;
}

export const useTypingEffect = ({
  texts,
  speed = 100,
  pauseTime = 2000,
  loop = true
}: UseTypingEffectOptions) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (texts.length === 0) return;

    const currentFullText = texts[currentTextIndex];

    if (isPaused) {
      const pauseTimeout = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseTime);
      return () => clearTimeout(pauseTimeout);
    }

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (currentText.length < currentFullText.length) {
          setCurrentText(currentFullText.slice(0, currentText.length + 1));
        } else {
          // Finished typing, start pause
          setIsPaused(true);
        }
      } else {
        // Deleting
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, currentText.length - 1));
        } else {
          // Finished deleting, move to next text
          setIsDeleting(false);
          if (loop) {
            setCurrentTextIndex((prev) => (prev + 1) % texts.length);
          } else if (currentTextIndex < texts.length - 1) {
            setCurrentTextIndex((prev) => prev + 1);
          }
        }
      }
    }, isDeleting ? speed / 2 : speed); // Delete faster than typing

    return () => clearTimeout(timeout);
  }, [currentText, currentTextIndex, isDeleting, isPaused, texts, speed, pauseTime, loop]);

  return currentText;
};
