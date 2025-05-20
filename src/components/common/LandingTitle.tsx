import React, { useEffect, useState, useMemo } from "react";
import styles from './Landing.module.css'; // Assuming styles are in Landing.module.css

const TAGLINES: string[] = [
  "Empowering your schedule, your time.",
  "Seamless shift swaps, simplified.",
  "Work-life balance, effortlessly managed.",
  "Intelligent scheduling, designed for you.",
  "Take control of your shifts with ease.",
  "Your time, your rules, our platform."
];

const TYPING_SPEED = 100; // Milliseconds per character
const DELETING_SPEED = 50; // Milliseconds per character
const PAUSE_DURATION = 2000; // Milliseconds to pause after typing

const LandingTitle: React.FC = () => {
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  const currentTagline = useMemo(() => TAGLINES[taglineIndex % TAGLINES.length], [taglineIndex]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isDeleting) {
      if (charIndex > 0) {
        timer = setTimeout(() => {
          setDisplayedText(currentTagline.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        }, DELETING_SPEED);
      } else {
        // Finished deleting
        setIsDeleting(false);
        setTaglineIndex(prevIndex => prevIndex + 1);
        // charIndex will be reset by the typing effect below
      }
    } else {
      // Typing
      if (charIndex < currentTagline.length) {
        timer = setTimeout(() => {
          setDisplayedText(currentTagline.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        }, TYPING_SPEED);
      } else {
        // Finished typing, pause then start deleting
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, PAUSE_DURATION);
      }
    }

    return () => clearTimeout(timer);
  }, [charIndex, currentTagline, isDeleting, taglineIndex]);
  
  // Reset charIndex when currentTagline changes (due to taglineIndex update) and not deleting
  useEffect(() => {
    if (!isDeleting) {
        setCharIndex(0);
        setDisplayedText(""); // Start fresh for the new tagline
    }
  }, [currentTagline, isDeleting]);


  return (
    // Apply the .tagline style from Landing.module.css
    // The blinking cursor will be handled by CSS in Landing.module.css
    <p className={styles.tagline}>
      {displayedText}
      <span className={styles.cursor}></span> {/* Cursor element */}
    </p>
  );
};

export default LandingTitle;
