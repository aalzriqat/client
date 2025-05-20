import React from "react";
// Link is no longer directly used here, Button component will handle it.
import LandingTitle from "./LandingTitle";
import Button from "./Button/Button"; // Import the reusable Button component
import styles from './Landing.module.css'; // Import CSS Module

const Landing: React.FC = () => {
  return (
    <div className={styles.landingContainer}>
      <div className={styles.contentWrapper}>
        <h1 className={styles.logo}>Scheduler</h1>
        {/* Assuming LandingTitle renders the tagline. If it's just text, could be: */}
        {/* <p className={styles.tagline}>Your smart scheduling solution.</p> */}
        <LandingTitle />
        <div className={styles.buttonGroup}>
          <Button as="Link" to="/register" variant="primary" size="large" fullWidth>
            Sign Up
          </Button>
          <Button as="Link" to="/login" variant="secondary" size="large" fullWidth>
            {/* Changed to secondary or outline for less emphasis than primary */}
            Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Landing;