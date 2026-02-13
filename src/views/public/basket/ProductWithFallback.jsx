import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { setInitial } from "../../../redux/cart";
import CounterBasket from "../../../components/counter-basket";
import { DEFAULT_COLOR_MAP } from '../../../Libs/attribute_colors/colors';
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";
import ImageIcon from '../../../resources/defaultImageIcon';

// Helper function to validate image source
const isValidImageSource = (src) => {
  if (!src) return false;
  if (typeof src !== 'string') return false;
  if (src.trim() === '') return false;
  return true;
};

// Hook to safely handle image sources
const useSafeImageSrc = (src) => {
  const [safeSrc, setSafeSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    setSafeSrc(src);
    setHasError(false);
  }, [src]);
  
  return { safeSrc, hasError, setHasError };
};

const ProductWithFallback = ({ onRemoveStart, ...props }) => {
  const cartItems = useSelector((state) => state.cart.items || []);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  // Helper functions to extract data from props
  const getImageSource = (item) => {
    let potentialSrc = null;
    
    if (item.items && Array.isArray(item.items) && item.items.length > 0) {
      if (item.items[0]?.image) potentialSrc = item.items[0].image;
    }
    if (!potentialSrc && item.image) potentialSrc = item.image;
    if (!potentialSrc && item.product?.image) potentialSrc = item.product.image;
    if (!potentialSrc && item.img) potentialSrc = item.img;
    
    // Handle array cases like [] or [""]
    if (Array.isArray(potentialSrc)) {
      if (potentialSrc.length === 0) return null;
      potentialSrc = potentialSrc[0];
    }
    
    // Validate the source
    if (!isValidImageSource(potentialSrc)) return null;
    
    return potentialSrc;
  };

  const getProductName = (item) => {
    if (item.items && Array.isArray(item.items) && item.items.length > 0) {
      return item.items[0].name || item.items[0].title || "محصول";
    }
    if (item.name) return item.name;
    if (item.title) return item.title;
    if (item.product?.name) return item.product.name;
    return "محصول";
  };

  const getProductId = (item) => {
    if (item.productId) return item.productId;
    if (item.product_id) return item.product_id;
    if (item.product?.id) return item.product.id;
    if (item.id) return item.id;
    return null;
  };

  const getCombinationsID = (item) => {
    if (item.combinationsID) return item.combinationsID;
    if (item.combinations_id) return item.combinations_id;
    if (item.combination_id) return item.combination_id;
    return null;
  };

  const getSeller = (item) => {
    if (item.seller) return item.seller;
    if (item.seller_id) return { id: item.seller_id };
    return null;
  };

  const getAttributes = (item) => {
    if (item.attributes) return item.attributes;
    if (item.attrs) return item.attrs;
    return [];
  };

  const getPrice = (item) => {
    const p = item?.price ?? item?.product?.price;
    if (p == null) return 0;
    if (typeof p === "number") return p;
    return Number(p?.regularPrice ?? p?.discountedPrice ?? p?.regular ?? p?.discounted ?? 0) || 0;
  };

  const getCount = (item) => {
    if (item.count) return item.count;
    if (item.quantity) return item.quantity;
    if (item.qty) return item.qty;
    return 1;
  };

  const getStock = (item) => {
    if (item.stock) return item.stock;
    if (item.product?.stock) return item.product.stock;
    return 0;
  };

  const getDeliveryInfo = (item) => {
    if (item.delivery) return item.delivery;
    if (item.deliveryInfo) return item.deliveryInfo;
    if (item.delivery_info) return item.delivery_info;
    return null;
  };

  const getShippingType = (item) => {
    const delivery = getDeliveryInfo(item);
    if (delivery?.type) return delivery.type;
    if (item.shippingType) return item.shippingType;
    if (item.shipping_type) return item.shipping_type;
    return "ارسال رایگان";
  };

  const getDeliveryTime = (item) => {
    const delivery = getDeliveryInfo(item);
    if (delivery?.time) return delivery.time;
    if (item.deliveryTime) return item.deliveryTime;
    if (item.delivery_time) return item.delivery_time;
    return "شنبه ۱۵ آذر - ۱۰ تا ۱۲";
  };

  // Extract data
  const rawSrc = getImageSource(props);
  const { safeSrc, hasError, setHasError } = useSafeImageSrc(rawSrc);
  const productName = getProductName(props);
  const productId = getProductId(props);
  const productIdStr = String(productId);
  const combinationsID = getCombinationsID(props);
  const seller = getSeller(props);
  const attributes = getAttributes(props);
  const price = getPrice(props);
  const count = getCount(props);
  const stock = getStock(props);
  const shippingType = getShippingType(props);
  const deliveryTime = getDeliveryTime(props);

  // Check if we should show fallback image
  const shouldShowFallback = !safeSrc || hasError;

  // Check if item is in cart
  const isInCart = cartItems.some(
    (item) =>
      String(item.productId) === String(productId) &&
      parseInt(item.combinationsID) === parseInt(combinationsID) &&
      (item.seller?.id || item.seller_id) === (seller?.id || props.seller_id)
  );

  // Hide component if item is not in cart
  useEffect(() => {
    setIsVisible(isInCart);
  }, [isInCart]);

  const handleCartRemovalComplete = async () => {
    if (onRemoveStart) {
      onRemoveStart();
    }
  };

  // Remove from cart API
  const removeFromCartAPI = async (productId, seller, combinationsID) => {
    const token = localStorage.getItem("user");
    
    try {
      const response = await fetch(getApiUrl("/cart/remove"), {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          productId,
          seller,
          combinationsID
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || "Failed to remove item from cart");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  };

  // Full remove function (with API call); refresh cart from userInitialData cache
  const removeItem = async () => {
    if (isRemoving || !isInCart) return;
    
    setIsRemoving(true);
    
    if (onRemoveStart) {
      onRemoveStart();
    }
    
    try {
      const removeResponse = await removeFromCartAPI(
        productId,
        seller,
        combinationsID
      );
      
      if (removeResponse?.message === "ok") {
        if (Array.isArray(removeResponse.cart)) {
          dispatch(setInitial(removeResponse.cart));
        } else {
          queryClient.invalidateQueries({ queryKey: ["userInitialData"] });
        }
        
        setIsVisible(false);
      } else {
        throw new Error("Remove operation failed");
      }
      
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      queryClient.invalidateQueries({ queryKey: ["userInitialData"] });
    } finally {
      setIsRemoving(false);
    }
  };

  // UI-only remove function
  const removeItemUIOnly = () => {
    setIsVisible(false);
  };

  // Don't render if item is not visible or not in cart
  if (!isVisible || !isInCart) {
    return null;
  }

  return (
    <div 
      id="jet-items1" 
      className="flex flex-col gap-6 py-5 px-5 rounded md:px-5 bg-white"
      style={{
        opacity: isRemoving ? 0.5 : 1,
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        transform: isRemoving ? 'scale(0.95)' : 'scale(1)'
      }}
    >
      {/* Header: Shipping Type and Item Count */}
      <div className="flex gap-2 items-center text-gray-700 text-xs md:text-sm">
        <p className="text-gray-700 text-xs md:text-sm font-bold">{shippingType}</p>
        <p className="md:inline-block mr-auto text-gray-700 text-xs md:text-sm font-bold">{count} کالا</p>
      </div>

      {/* Product Image and Counter */}
      <div className="flex justify-between gap-2">
        <div className="flex overflow-hidden gap-1 md:gap-2" style={{ flexBasis: '80%' }}>
          <div className="relative">
            <div 
              style={{ 
                width: '62px', 
                height: '62px', 
                lineHeight: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: shouldShowFallback ? '#f3f4f6' : 'transparent',
                borderRadius: '8px'
              }}
            >
              {shouldShowFallback ? (
                <ImageIcon size={32} color="#9ca3af" />
              ) : (
                <picture>
                  <img 
                    className="w-full inline-block" 
                    src={safeSrc} 
                    width="62" 
                    height="62" 
                    alt={productName}
                    title={productName}
                    style={{ objectFit: 'contain' }}
                    onError={() => setHasError(true)}
                  />
                </picture>
              )}
            </div>
          </div>
        </div>

        <div 
          className="flex items-center justify-center
                        border-white border-2 border-solid
                        rounded-lg bg-gray-600
                        text-xs text-white
                        absolute right-2 top-14"
          style={{ minWidth: '20px', height: '18px' }}
        >
          {count}
        </div>

        {/* Counter Basket Component */}
        <div className="flex-1">
          <CounterBasket
            fullWidth
            withButton
            productId={productIdStr}
            seller={seller}
            stock={stock}
            combinationsID={combinationsID}
            removeFun={removeItemUIOnly}
            onRemoveComplete={handleCartRemovalComplete}
            count={count}
            productImage={safeSrc}
            attributes={attributes}
            poductName={productName}
            price={price}
            max={props.max}
            min={props.min}
          />
        </div>
      </div>

      
    </div>
  );
};

// Empty Cart Component with Digikala-style design
const EmptyCartComponent = () => (
  <div className="container mx-auto py-6 px-4">
    <div className="flex flex-col gap-6 py-8 md:py-12 border border-gray-200 rounded bg-white px-5">
      <div className="flex flex-col items-center justify-center py-8 md:py-12">
        <div className="flex flex-col items-center gap-6 max-w-md text-center">
          {/* Icon Container */}
          <div className="relative flex items-center justify-center">
            <div 
              className="flex items-center justify-center rounded-full bg-gray-100"
              style={{ 
                width: '120px', 
                height: '120px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
              }}
            >
              <svg 
                width="60" 
                height="60" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M9 2L7.17 4H4C2.9 4 2 4.9 2 6V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V6C22 4.9 21.1 4 20 4H16.83L15 2H9ZM9 5H15L16.83 7H20V19H4V7H7.17L9 5Z" 
                  fill="#9ca3af"
                />
                <line x1="4" y1="4" x2="20" y2="20" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          
          {/* Text Content */}
          <div className="flex flex-col gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              سبد خرید شما خالی است!
            </h2>
            <p className="text-sm md:text-base text-gray-600">
              می‌توانید برای مشاهده محصولات بیشتر به صفحات زیر بروید
            </p>
          </div>
          
          {/* Action Button */}
          <a 
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 text-sm md:text-base font-bold text-white rounded transition-colors duration-200"
            style={{ 
              textDecoration: 'none',
              backgroundColor: '#5e87c8',
              ':hover': { backgroundColor: '#3f6db3' }
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3f6db3'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#5e87c8'}
          >
            مشاهده محصولات
          </a>
        </div>
      </div>
    </div>
  </div>
);

export default ProductWithFallback;
export { EmptyCartComponent };
