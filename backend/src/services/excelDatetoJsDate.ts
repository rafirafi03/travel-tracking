export function convertExcelDateToJSDate(serial: number): Date {
    // Excel's epoch is January 1, 1900
    const excelEpoch = new Date(1900, 0, 1);
    // Calculate the number of milliseconds since the Excel epoch
    const millisecondsSinceExcelEpoch = (serial - 1) * 24 * 60 * 60 * 1000;
    // Add the milliseconds to the Excel epoch to get the JavaScript Date
    return new Date(excelEpoch.getTime() + millisecondsSinceExcelEpoch);
  }
  