import React from 'react';
import { toPersianDigits, formatPersianNumber, formatPersianPrice } from '../../Libs/utils/persianNumbers';

/**
 * Component to display numbers with Persian digits
 */
export const PersianNumber = ({ 
  children, 
  format = false, 
  price = false, 
  currency = 'تومان',
  ...props 
}) => {
  const displayValue = () => {
    if (price) {
      return formatPersianPrice(children, currency);
    } else if (format) {
      return formatPersianNumber(children);
    } else {
      return toPersianDigits(children);
    }
  };

  return (
    <span className="persian-digits" {...props}>
      {displayValue()}
    </span>
  );
};

export default PersianNumber;