import * as XLSX from 'xlsx';

// Define a generic type for the data array, where each item is an object
// with string keys and any type of values.
type DataItem = Record<string, any>;

const exportToExcel = (data: DataItem[], fileName: string = "data.xlsx"): void => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn("No data provided to exportToExcel or data is not an array.");
    // Optionally, show an alert to the user or throw an error
    // alert("No data available to export.");
    return;
  }
  try {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, fileName);
  } catch (error) {
    console.error("Error exporting data to Excel:", error);
    // Optionally, alert the user
    // alert("An error occurred while exporting data to Excel. Please check the console for details.");
  }
};

export default exportToExcel;