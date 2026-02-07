/**
 * Recipe Book button component
 *
 * Displays a clickable book icon that toggles the recipe book interface.
 * Styled after Minecraft's inventory recipe book toggle.
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the recipe book is currently open
 * @param {Function} props.onClick - Handler for toggle interaction
 * @returns {JSX.Element} Recipe book button with active state styling
 */

import React from 'react';
import styles from './RecipeBook.module.css';

const RecipeBook = ({ isOpen, onClick }) => {
  return (
    <button
      className={`${styles.recipeButton} ${isOpen ? styles.active : ''}`}
      onClick={onClick}
      title="Recipe Book"
    >
      <div className={styles.bookIcon} />
    </button>
  );
};

export default RecipeBook;
