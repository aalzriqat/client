import React, { ChangeEvent } from 'react';

interface SelectFilterProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  options: (string | number)[]; // Options can be string or number
  label?: string; // Optional label prop
  defaultOptionText?: string; // Optional text for the "All" or default option
  className?: string; // Optional className for the select element
}

const SelectFilter: React.FC<SelectFilterProps> = ({
  value,
  onChange,
  options,
  label,
  defaultOptionText = "All",
  className = "small-select" // Default class if not provided
}) => (
  <div className="select-filter-container" style={{ display: 'flex', flexDirection: 'column', marginRight: '10px' }}> {/* Basic styling for label and select */}
    {label && <label htmlFor={label.replace(/\s+/g, '-').toLowerCase()} style={{ marginBottom: '2px', fontSize: '0.9em' }}>{label}</label>}
    <select 
      id={label ? label.replace(/\s+/g, '-').toLowerCase() : undefined}
      value={value} 
      onChange={onChange} 
      className={className}
    >
      <option value="">{defaultOptionText}</option>
      {options.map((option, index) => (
        <option key={`${option}-${index}`} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

export default SelectFilter;