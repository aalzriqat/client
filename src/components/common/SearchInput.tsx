import React, { ChangeEvent } from 'react';

interface SearchInputProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  placeholder?: string;
  className?: string; // Allow passing custom class
  ariaLabel?: string; // For accessibility
}

const SearchInput: React.FC<SearchInputProps> = ({
  searchQuery,
  setSearchQuery,
  placeholder = "Search...", // Default placeholder
  className = "search-input", // Default class
  ariaLabel 
}) => {
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <input
      type="text"
      placeholder={placeholder}
      value={searchQuery}
      onChange={handleSearch}
      className={className} // Use passed or default class
      aria-label={ariaLabel || placeholder} // Use provided aria-label or fallback to placeholder
      // style={{ padding: '8px', marginRight: '10px' }} // Removed inline style, now handled by .search-input class
    />
  );
};

export default SearchInput;