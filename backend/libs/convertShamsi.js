import moment from "moment-jalaali";

// Function to convert a Gregorian date to Shamsi (Jalali) format
export const toShamsiDate = (date) => {
  return moment(date).format("jYYYY/jMM/jDD HH:mm"); // Example: 1403/01/07 14:30
};

export const convertToGregorian = (persianDate) => {
  return moment(persianDate, 'jYYYY/jM/jD').format('YYYY-MM-DD');
};