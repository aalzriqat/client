import React, { ChangeEvent } from 'react';
import { useTheme, ThemeName } from '../../../context/ThemeContext'; // Adjusted path
import styles from './ThemeSelector.module.css';

const ThemeSelector: React.FC = () => {
  const { theme, setTheme, availableThemes } = useTheme();

  const handleThemeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setTheme(event.target.value as ThemeName);
  };

  return (
    <div className={styles.themeSelectorContainer}>
      <label htmlFor="theme-select" className={styles.label}>Theme:</label>
      <select 
        id="theme-select" 
        value={theme} 
        onChange={handleThemeChange} 
        className={styles.select}
      >
        {availableThemes.map((themeOption) => (
          <option key={themeOption.value} value={themeOption.value}>
            {themeOption.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSelector;