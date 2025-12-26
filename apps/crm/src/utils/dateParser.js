/**
 * Parse date strings in various formats to Date objects
 * @param {string} dateString - Date string in various formats
 * @returns {Date|null} - Parsed Date object or null if invalid
 */
const parseDate = (dateString) => {
  if (!dateString) return null;
  
  // Try parsing as ISO date first (YYYY-MM-DD)
  let date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  // Try parsing DD-MM-YYYY format
  const dmyParts = dateString.split('-');
  if (dmyParts.length === 3) {
    const day = parseInt(dmyParts[0], 10);
    const month = parseInt(dmyParts[1], 10) - 1; // Months are 0-indexed
    const year = parseInt(dmyParts[2], 10);
    date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  // Try parsing MM/DD/YYYY format
  const mdyParts = dateString.split('/');
  if (mdyParts.length === 3) {
    const month = parseInt(mdyParts[0], 10) - 1; // Months are 0-indexed
    const day = parseInt(mdyParts[1], 10);
    const year = parseInt(mdyParts[2], 10);
    date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  return null;
};

module.exports = { parseDate };