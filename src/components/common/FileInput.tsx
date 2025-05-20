import React, { ChangeEvent } from 'react';

interface FileInputProps {
  onFileChange: (file: File | null) => void;
  accept?: string; // To make it more reusable, e.g., ".xlsx,.xls,.csv" or "image/*"
  className?: string;
  id?: string;
  // Add other input props if needed, like 'disabled'
}

const FileInput: React.FC<FileInputProps> = ({ 
  onFileChange, 
  accept = ".xlsx, .xls", // Default to Excel files as in original
  className,
  id
}) => {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onFileChange(event.target.files[0]);
    } else {
      onFileChange(null);
    }
    // Reset the input value to allow selecting the same file again if needed
    event.target.value = ''; 
  };

  return (
    // The div might not be necessary unless used for specific styling/layout
    // For now, keeping it as it was.
    <div> 
      <input 
        type="file"
        id={id}
        accept={accept}
        onChange={handleFileChange}
        className={className} // Apply passed className
        // style={{ display: 'none' }} // Example: if you want to style a label as the button
      />
      {/* Example: if using a styled label
      <label htmlFor={id || "file-input-default"} className="custom-file-button">
        Choose File
      </label> 
      */}
    </div>
  );
};

export default FileInput;
