'use client';

import { useState, useEffect } from 'react';

interface TypingTextProps {
  words: string[];
}

export default function TypingText({ words }: TypingTextProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (words.length === 0) return;

    let timer: NodeJS.Timeout;
    const activeWord = words[currentWordIndex];
    
    // Configurable speeds (ms)
    const typingSpeed = isDeleting ? 30 : 60;
    const pauseBeforeDelete = 2000;
    const pauseBeforeNextWord = 500;

    const tick = () => {
      if (!isDeleting) {
        // Add one character
        const updatedText = activeWord.substring(0, currentText.length + 1);
        setCurrentText(updatedText);

        if (updatedText === activeWord) {
          // Finished typing, pause
          timer = setTimeout(() => setIsDeleting(true), pauseBeforeDelete);
          return;
        }
      } else {
        // Remove one character
        const updatedText = activeWord.substring(0, currentText.length - 1);
        setCurrentText(updatedText);

        if (updatedText === '') {
          // Finished deleting, load next word
          setIsDeleting(false);
          setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
          timer = setTimeout(tick, pauseBeforeNextWord);
          return;
        }
      }

      timer = setTimeout(tick, typingSpeed);
    };

    timer = setTimeout(tick, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, words]);

  return (
    <span className="text-purple-400 font-bold typing-cursor">
      {currentText}
    </span>
  );
}
