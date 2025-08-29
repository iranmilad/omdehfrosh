import React from 'react';
import { safeIncludes, isEmpty, toSafeArray } from './safe-includes-utils';

const PaymentCalcReceipt = ({ items = [], searchValue = '' }) => {
  
  // Debug function to log problematic data
  const debugItem = (item, index) => {
    if (isEmpty(item.productId)) {
      console.warn(`Item ${index} has invalid productId:`, {
        productId: item.productId,
        type: typeof item.productId,
        item: item
      });
    }
  };

  return (
    <div>
      {items.map((item, index) => {
        // Debug logging for development
        if (process.env.NODE_ENV === 'development') {
          debugItem(item, index);
        }

        // Handle completely invalid items
        if (!item || typeof item !== 'object') {
          return null;
        }

        // Safe productId handling
        const productId = item.productId;
        
        // Multiple approaches to handle the includes check:
        
        // Approach 1: Use safeIncludes utility
        const hasSearchValue = safeIncludes(productId, searchValue);
        
        // Approach 2: Manual safety check
        const hasSearchValueManual = (() => {
          if (!productId && productId !== 0 && productId !== false) return false;
          if (productId === "") return false;
          if (Array.isArray(productId)) {
            if (productId.length === 0) return false;
            const validItems = productId.filter(id => id !== null && id !== undefined && id !== "");
            if (validItems.length === 0) return false;
            return validItems.some(id => String(id).includes(searchValue));
          }
          if (typeof productId === 'string') {
            return productId.includes(searchValue);
          }
          if (typeof productId === 'number') {
            return String(productId).includes(searchValue);
          }
          return false;
        })();
        
        // Approach 3: Convert to safe array first
        const productIds = toSafeArray(productId);
        const hasSearchValueArray = productIds.some(id => 
          String(id).includes(searchValue)
        );

        // Skip rendering if item is invalid
        if (isEmpty(productId)) {
          return (
            <div key={item.id || index} className="invalid-item">
              <span>⚠️ Invalid product data</span>
            </div>
          );
        }

        return (
          <div key={item.id || index} className="receipt-item">
            <div>Product ID: {Array.isArray(productId) ? productId.join(', ') : productId}</div>
            <div>Has Search Value: {hasSearchValue ? '✅' : '❌'}</div>
            {/* Your existing component logic here */}
          </div>
        );
      }).filter(Boolean)} {/* Remove null entries */}
    </div>
  );
};

// Alternative: Higher-order component for error boundary
const withSafeIncludes = (WrappedComponent) => {
  return function SafeIncludesWrapper(props) {
    try {
      return <WrappedComponent {...props} />;
    } catch (error) {
      if (error.message.includes('includes is not a function')) {
        return (
          <div className="error-fallback">
            <p>⚠️ Data format error detected</p>
            <p>Please check your data structure</p>
          </div>
        );
      }
      throw error; // Re-throw other errors
    }
  };
};

// Usage:
// export default withSafeIncludes(PaymentCalcReceipt);

export default PaymentCalcReceipt;