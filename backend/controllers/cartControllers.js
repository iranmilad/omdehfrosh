import { generateToken } from "../jwt/jwt_func.js";
import Cart from "../models/Cart.js"; // Ensure the correct path
import jwt from "jsonwebtoken";
import FinalReceipt from "../models/FinalReciept.js";
import DiscountCode from "../models/DiscountCode.js";
import getUserFromToken from "../libs/verifyToken.js";
import SingleProduct from '../models/SingleProduct.js'
import Subscription from "../models/Subscription.js";
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import OrderJ2B from "../models/Orders_J2B.js"; // Your order schema
import UserAccount from "../models/User.js"; // Your user schema
import OrderItemJ2B from "../models/OrderItemJ2B.js";


export const getCart = async (req, res) => {
  try {
    const user = getUserFromToken(req);

    if (!user || !user.user_id) {
      return res.json({ message: "Cart is empty", cart: [], total: 0 });
    }

    const { user_id } = user;

    // Find the basket order for this user
    const basketOrder = await OrderJ2B.findOne({ 
      user_id: user_id.toString(), 
      status: "basket" 
    });

    if (!basketOrder) {
      return res.json({ message: "Cart is empty", cart: [], total: 0 });
    }

    // Find all order items for this basket
    const orderItems = await OrderItemJ2B.find({ 
      order_id: basketOrder.id 
    });

    if (!orderItems || orderItems.length === 0) {
      return res.json({ message: "Cart is empty", cart: [], total: 0 });
    }

    const cartItems = [];
    let totalAmount = 0;

    for (const orderItem of orderItems) {
      // Group items by product and combination
      const productCombinations = {};

      for (const productInfo of orderItem.product_id) {
        const key = `${productInfo.id}-${productInfo.combinationId}`;
        
        if (!productCombinations[key]) {
          productCombinations[key] = {
            productId: productInfo.id,
            combinationId: productInfo.combinationId,
            quantity: 0
          };
        }
        productCombinations[key].quantity += 1;
      }

      for (const [key, productCombination] of Object.entries(productCombinations)) {
        // Fetch product details
        const product = await SingleProduct.findOne({ id: productCombination.productId });
        
        if (!product) continue;

        // Find the specific combination
        const combination = product.combinations.find(
          c => c.id.toString() === productCombination.combinationId
        );

        if (!combination) continue;

        // Find the supplier details from the combination
        const supplier = combination.suppliers.find(
          s => s.id === orderItem.supplier_id
        );

        if (!supplier) continue;

        // Calculate individual item quantity (total quantity / number of different products)
        const itemQuantity = Math.floor(orderItem.quantity / orderItem.product_id.length) || 1;
        
        // Build attributes object
        const attributes = {};
        combination.options.forEach(option => {
          if (option.type === 'color') {
            attributes.color = option.value;
          } else if (option.type === 'material') {
            attributes.material = option.value;
          }
          // Add more attribute types as needed
        });

        const cartItem = {
          price: {
            regularPrice: supplier.price.regularPrice,
            discountPercent: supplier.price.discountPercent,
            discountedPrice: supplier.price.discountedPrice
          },
          seller: {
            id: supplier.id,
            label: supplier.name
          },
          productId: product.id,
          combinationsID: combination.id,
          seller_id: supplier.id,
          name: product.general.title,
          image: product.general.images[0] || null,
          count: itemQuantity,
          max: supplier.maxOrder,
          min: supplier.minOrder,
          attributes: [attributes]
        };

        cartItems.push(cartItem);

        // Calculate total for this item
        const itemPrice = supplier.price.discountedPrice || supplier.price.regularPrice;
        totalAmount += itemPrice * itemQuantity;
      }
    }

    // Alternative: Use the total from the order if you prefer
    // totalAmount = basketOrder.total_price;

    return res.json({
      message: "ok",
      cart: cartItems,
      total: totalAmount
    });

  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({ 
      message: "Internal server error", 
      cart: [], 
      total: 0 
    });
  }
};

// Alternative simplified version if you want to use order totals directly
export const getCartSimplified = async (req, res) => {
  try {
    const user = getUserFromToken(req);

    if (!user || !user.user_id) {
      return res.json({ message: "Cart is empty", cart: [], total: 0 });
    }

    const { user_id } = user;

    // Find basket order with populated order items
    const basketOrder = await Order.aggregate([
      { $match: { user_id: user_id.toString(), status: "basket" } },
      {
        $lookup: {
          from: "orderitemj2b",
          localField: "id",
          foreignField: "order_id",
          as: "orderItems"
        }
      }
    ]);

    if (!basketOrder.length || !basketOrder[0].orderItems.length) {
      return res.json({ message: "Cart is empty", cart: [], total: 0 });
    }

    const order = basketOrder[0];
    const cartItems = [];

    for (const orderItem of order.orderItems) {
      for (const productInfo of orderItem.product_id) {
        const product = await Product.findOne({ id: productInfo.id });
        
        if (!product) continue;

        const combination = product.combinations.find(
          c => c.id.toString() === productInfo.combinationId
        );

        if (!combination) continue;

        const supplier = combination.suppliers.find(
          s => s.id === orderItem.supplier_id
        );

        if (!supplier) continue;

        const attributes = {};
        combination.options.forEach(option => {
          if (option.attribute_name === 'رنگ') {
            attributes.color = option.value;
          } else if (option.attribute_name === 'جنس') {
            attributes.material = option.value;
          }
        });

        cartItems.push({
          price: {
            regularPrice: supplier.price.regularPrice,
            discountPercent: supplier.price.discountPercent,
            discountedPrice: supplier.price.discountedPrice
          },
          seller: {
            id: supplier.id,
            label: supplier.name
          },
          productId: product.id,
          combinationsID: combination.id,
          seller_id: supplier.id,
          name: product.general.title,
          image: product.general.images[0] || null,
          count: orderItem.quantity,
          max: supplier.maxOrder,
          min: supplier.minOrder,
          attributes: [attributes]
        });
      }
    }

    return res.json({
      message: "ok",
      cart: cartItems,
      total: order.total_price
    });

  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({ 
      message: "Internal server error", 
      cart: [], 
      total: 0 
    });
  }
};

export const updateCartSubscription = async (req, res) => {

  const { user_id } = getUserFromToken(req, res);

  const {
    productId,
    combinationsID,
    seller,
    count
  } = req.body;



  const seller_id = seller?.id;
  if (!seller_id) return res.status(400).json({ message: "Seller ID missing" });

  if (typeof count !== "number" || isNaN(count)) {
    return res.status(400).json({ message: "Invalid count value" });
  }

  try {
    const subscription = await Subscription.findOne({ modelId: productId });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription product not found" });
    }

    // Validate seller
    if (subscription.sellerId !== seller_id) {
      return res.status(404).json({ message: "Seller not matched with subscription" });
    }

    // ✅ Build cart item
    const cartItem = {
      productId: subscription.modelId,
      combinationsID: subscription.combinationsID,
      seller_id,
      name: subscription.title,
      image: "/static/image/subscription-default.webp", // Use default or derive from DB
      count,
      max: 1,
      min: 1,
      attributes: [],
      price: {
        regularPrice: subscription.price.regularPrice,
        discountedPrice: subscription.price.discountedPrice,
        discountPercent: subscription.price.discountPer || null
      },
      seller
    };

    // ✅ Find or create cart
    let existingCart = await Cart.findOne({ user_id });

    if (!existingCart) {
      const cartId = `j2bcart${Date.now().toString().slice(-10)}`;
      existingCart = new Cart({
        user_id,
        cart_id: cartId,
        isActive: true,
        cartItems: [cartItem]
      });
    } else {
      const existingItem = existingCart.cartItems.find(
        item =>
          item.productId === subscription.modelId &&
          item.combinationsID === subscription.combinationsID &&
          item.seller_id === seller_id
      );

      if (existingItem) {
        existingItem.count = count;
      } else {
        existingCart.cartItems.push(cartItem);
      }
    }

    await existingCart.save();

    res.json({
      message: "کارت با موفقیت به روز رسانی شد.",
      cart_id: existingCart.cart_id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating subscription cart", error });
  }
};

// export const updateCart = async (req, res) => {
//   const { user_id } = getUserFromToken(req, res); // Token handling

//   const {
//     productId,
//     combinationsID,
//     seller, // { id, label }
//     count
//   } = req.body;




//   const seller_id = seller?.id;

//   if (!seller_id) return res.status(400).json({ message: "Seller ID missing" });


//   if (typeof count !== "number" || isNaN(count)) {
//     return res.status(400).json({ message: "Invalid count value" });
//   }



//   try {
//     const product = await SingleProduct.findOne({ id: productId });

//     if (!product) return res.status(404).json({ message: "Product not found" });

//     const combination = product.combinations.find(c => c.id === combinationsID);

//     if (!combination) return res.status(404).json({ message: "Combination not found" });

//     const supplier = combination.suppliers.find(s => s.id === seller_id);



//     if (!supplier) return res.status(404).json({ message: "Seller not found for this combination" });

//     // ✅ Build attribute object (flattened)
//     const attributes = {};

    

//     combination.options.forEach(opt => {
//       // if (opt.type === "color") {
//         attributes[opt.type] = opt.value;
//       // } else {
//         // attributes[opt.attribute_name] = opt.value;
//       // }
//     });



//     // ✅ Create the cart item
//     const cartItem = {
//       productId,
//       combinationsID,
//       seller_id,
//       name: product.general.title,
//       image: product.general.images?.[0] || "",
//       count,
//       max: supplier.maxOrder || 50,
//       min: supplier.minOrder || 1,
//       attributes: [attributes],
//       price: {
//         regularPrice: supplier.price.regularPrice,
//         discountedPrice: supplier.price.discountedPrice,
//         discountPercent: supplier.price.discountPercent || null
//       },
//       seller
//     };

//     // ✅ Find or create user's cart
//     let existingCart = await Cart.findOne({ user_id });

//     if (!existingCart) {
//       const cartId = `j2bcart${Date.now().toString().slice(-10)}`;
//       existingCart = new Cart({
//         user_id,
//         cart_id: cartId,
//         isActive: true,
//         cartItems: [cartItem]
//       });
//     } else {
//       const existingItem = existingCart.cartItems.find(
//         item =>
//           item.productId === productId &&
//           item.combinationsID === combinationsID &&
//           item.seller_id === seller_id
//       );

//       if (existingItem) {
//         existingItem.count = count;
//       } else {
//         existingCart.cartItems.push(cartItem);
//       }
//     }

//     await existingCart.save();

//     res.json({
//       message: "Cart updated successfully",
//       cart_id: existingCart.cart_id
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error updating cart", error });
//   }
// };


// Cart Update API

export const updateCart = async (req, res) => {
  try {
    const { user_id } = getUserFromToken(req, res);
    const userIdStr = user_id.toString();
    const userIdNum = Number(user_id);

    const { productId, combinationsID, seller, count } = req.body;

    console.log(productId, combinationsID, seller, count )

    if (!user_id || !productId || !combinationsID || !seller?.id || !count) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: productId, combinationsID, seller.id, count",
      });
    }

    // Get customer info
    const customer = await UserAccount.findOne({ userId: userIdNum });
    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        message: "Customer not found" 
      });
    }

    const customerName = `${customer.name || ""} ${customer.family || ""}`.trim();
    const customerEmail = customer.email || null;
    const customerPhone = customer.mobile || null;

    // Get product info
    const product = await SingleProduct.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    // Find combination and supplier
    const selectedCombination = product.combinations.find(c => c.id === parseInt(combinationsID));
    if (!selectedCombination) {
      return res.status(404).json({ 
        success: false, 
        message: "Selected combination not found" 
      });
    }

    const selectedSupplier = selectedCombination.suppliers.find(s => s.id === parseInt(seller.id));
    if (!selectedSupplier) {
      return res.status(404).json({ 
        success: false, 
        message: "Selected supplier not found" 
      });
    }

    // Calculate prices correctly
    const regularUnitPrice = selectedSupplier.price.regularPrice;
    const discountedUnitPrice = selectedSupplier.price.discountedPrice || selectedSupplier.price.regularPrice;
    
    // Total prices for this item
    const itemTotalRegularPrice = regularUnitPrice * count;  // count * each item regular price (for price field)
    const itemTotalDiscountedPrice = discountedUnitPrice * count;  // count * each item discounted price (for totalPrice field)
    const itemTotalDiscount = itemTotalRegularPrice - itemTotalDiscountedPrice;  // total discount amount
    
    // Check existing basket
    let existingOrder = await OrderJ2B.findOne({ user_id: userIdStr, status: "basket" });
    const orderId = existingOrder?.id || `order_${uuidv4()}`;

    let order;

    if (existingOrder) {
      // Update existing order - we'll recalculate totals after handling order items
      order = await OrderJ2B.findOneAndUpdate(
        { id: existingOrder.id },
        {
          $set: {
            supplier_id: selectedSupplier.id,
            updatedAt: new Date()
          }
        },
        { new: true }
      );
    } else {
      // Create new order with initial values (will be recalculated)
      const orderData = {
        id: orderId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone_number: customerPhone,
        user_id: userIdStr,
        total_price: 0,  // Will be calculated after order items
        total_discount: 0,  // Will be calculated after order items
        discount_code_id: null,
        status: "basket",
        delivery_type: "store_delivery",
        payment_method: "cash",
        supplier_id: selectedSupplier.id
      };
      
      order = new OrderJ2B(orderData);
      await order.save();
    }

    // Check if an OrderItem exists for this order + supplier
    let orderItem = await OrderItemJ2B.findOne({ 
      order_id: orderId, 
      supplier_id: selectedSupplier.id 
    });

    if (orderItem) {
      // Check if this exact product + combination already exists
      const existingProduct = orderItem.product_id.find(p => 
        p.id === productId && 
        p.combinationId === combinationsID.toString()
      );

      if (existingProduct) {
        // Product exists -> REPLACE quantity and recalculate prices
        orderItem.quantity = count; // Set to new count
        orderItem.price = itemTotalRegularPrice; // Total regular price (count × unit regular price)
        orderItem.discount_price = discountedUnitPrice; // Unit discounted price
        orderItem.totalPrice = itemTotalDiscountedPrice; // Total price after discount (count × unit discounted price)

      } else {
        // Product doesn't exist -> add new product to existing order item
        orderItem.product_id.push({ 
          id: productId, 
          combinationId: combinationsID.toString()
        });
        
        // Add to existing quantities and prices
        const oldQuantity = orderItem.quantity;
        const newTotalQuantity = oldQuantity + count;
        
        // Update totals
        orderItem.quantity = newTotalQuantity;
        orderItem.price += itemTotalRegularPrice; // Add total regular price for new items
        orderItem.totalPrice += itemTotalDiscountedPrice; // Add total discounted price for new items
        
        // For discount_price, we need to calculate weighted average unit discounted price
        const avgDiscountedUnitPrice = orderItem.totalPrice / newTotalQuantity;
        orderItem.discount_price = avgDiscountedUnitPrice;
      }

      await orderItem.save();

    } else {
      // Create new order item
      orderItem = new OrderItemJ2B({
        id: `item_${uuidv4()}`,
        order_id: orderId,
        product_id: [{ 
          id: productId, 
          combinationId: combinationsID.toString()
        }],
        supplier_id: selectedSupplier.id,
        quantity: count,
        price: itemTotalRegularPrice, // Total regular price (count × unit regular price)
        discount_price: discountedUnitPrice, // Unit discounted price
        totalPrice: itemTotalDiscountedPrice, // Total price after discount (count × unit discounted price)
      });
      await orderItem.save();
    }

    // Recalculate order totals from all order items (most reliable approach)
    const allOrderItems = await OrderItemJ2B.find({ order_id: orderId });
    let newOrderTotalPrice = 0;
    let newOrderTotalDiscount = 0;

    for (let item of allOrderItems) {
      // Total price after discount for all items
      newOrderTotalPrice += item.totalPrice;
      
      // Total discount amount = total regular price - total discounted price
      const itemRegularTotal = item.price; // This is already the total regular price
      const itemDiscountedTotal = item.totalPrice; // This is total discounted price
      newOrderTotalDiscount += (itemRegularTotal - itemDiscountedTotal);
    }

    // Update order with recalculated totals
    order = await OrderJ2B.findOneAndUpdate(
      { id: orderId },
      {
        $set: {
          total_price: newOrderTotalPrice, // Total price after discount of all items
          total_discount: newOrderTotalDiscount, // Total discount amount of all items
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: existingOrder ? "Item added to existing cart" : "New cart created",
      data: {
        orderId: order.id,
        customer: {
          name: order.customer_name,
          email: order.customer_email,
          phone: order.customer_phone_number
        },
        pricing: {
          itemRegularPrice: itemTotalRegularPrice, // count * each item regular price
          itemDiscountedPrice: itemTotalDiscountedPrice, // count * each item discounted price  
          itemDiscount: itemTotalDiscount, // discount amount for this item
          cartTotalPrice: order.total_price, // Total price after discount of all items
          cartTotalDiscount: order.total_discount, // Total discount amount of all items
          cartRegularPrice: order.total_price + order.total_discount // Total regular price before discount
        },
        orderDetails: {
          status: order.status,
          deliveryType: order.delivery_type,
          paymentMethod: order.payment_method
        },
        addedItem: {
          productId: productId,
          productTitle: product.general.title,
          combinationsID: combinationsID,
          seller: {
            id: seller.id,
            label: seller.label,
            name: selectedSupplier.name
          },
          count: count,
          unitRegularPrice: regularUnitPrice,
          unitDiscountedPrice: discountedUnitPrice,
          totalRegularPrice: itemTotalRegularPrice,
          totalDiscountedPrice: itemTotalDiscountedPrice,
          sku: selectedSupplier.sku,
          selectedOptions: selectedCombination.options.map(opt => ({
            attributeName: opt.attribute_name,
            value: opt.value,
            type: opt.type
          }))
        }
      }
    });

  } catch (error) {
    console.error("Cart update error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Optional: Cleanup function to remove existing duplicates (run once)
export const cleanupCartDuplicates = async () => {
  try {
    console.log("Starting cleanup of duplicate cart items...");
    
    const orderItems = await OrderItemJ2B.find({});
    let cleanedCount = 0;
    
    for (let item of orderItems) {
      const originalLength = item.product_id.length;
      
      // Create a Map to store unique products by id + combinationId
      const uniqueProducts = new Map();
      
      for (let product of item.product_id) {
        const key = `${product.id}-${product.combinationId}`;
        if (!uniqueProducts.has(key)) {
          uniqueProducts.set(key, {
            id: product.id,
            combinationId: product.combinationId.toString() // Ensure string consistency
          });
        }
      }
      
      // Update with unique products only if duplicates were found
      if (originalLength > uniqueProducts.size) {
        item.product_id = Array.from(uniqueProducts.values());
        await item.save();
        cleanedCount++;
        console.log(`Cleaned item ${item.id}: ${originalLength} -> ${uniqueProducts.size} products`);
      }
    }
    
    console.log(`Cleanup completed. ${cleanedCount} items were cleaned.`);
    return { success: true, cleanedCount };
    
  } catch (error) {
    console.error("Error during cleanup:", error);
    return { success: false, error: error.message };
  }
};

/*
// Usage Example:

// API Call:
POST /api/cart/update
Headers: {
  "Authorization": "Bearer your-jwt-token"
}
Body: {
  "productId": "67f99acf3c98fda9bffa9738",
  "combinationsID": 19,
  "seller": {
    "id": 1,
    "label": "دیجی کالا"
  },
  "count": 2
}

// Response:
{
  "success": true,
  "message": "Item added to existing cart",
  "data": {
    "orderId": "order_123456",
    "customer": {
      "name": "سب سب سبسب",
      "email": "sajjsatt1111@gmail.com",
      "phone": "09380587367"
    },
    "pricing": {
      "itemPrice": 1900000,
      "itemDiscount": 100000,
      "cartTotalPrice": 3800000,
      "cartTotalDiscount": 200000,
      "cartFinalPrice": 3600000
    },
    "addedItem": {
      "productId": "67f99acf3c98fda9bffa9738",
      "productTitle": "گوشی موبایل اپل مدل پرومکس دو سیم‌ کارت نات اکتیو سیزده",
      "combinationsID": 19,
      "seller": {
        "id": 1,
        "label": "دیجی کالا",
        "name": "دیجی کالا"
      },
      "count": 2,
      "unitPrice": 950000,
      "totalPrice": 1900000
    }
  }
}
*/




export const removeFromCart = async (req, res) => {

  const {user_id} = getUserFromToken(req, res);

  const { productId, combinationsID, seller } = req.body;


  if (!productId || !combinationsID || !seller) {
    return res.status(400).json({ message: "Missing required parameters" });
  }


  try {
    let existingCart = await Cart.findOne({ user_id });

    if (!existingCart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // ✅ Ensure seller ID is compared correctly
    const updatedCartItems = existingCart.cartItems.filter(
      (item) => !(item.productId === productId && item.combinationsID === combinationsID && item.seller_id === seller.id) // Ensure correct seller field
    );
    

    if (updatedCartItems.length === existingCart.cartItems.length) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    if (updatedCartItems.length === 0) {
      await Cart.deleteOne({ user_id });
      return res.json({ message: "Cart is now empty and has been deleted", cart: [] });
    }

    existingCart.cartItems = updatedCartItems;
    await existingCart.save();

    res.json({ message: "Product removed successfully", cart: existingCart });

  } catch (error) {
    console.error("Error removing product from cart:", error);
    res.status(500).json({ message: "Error removing product from cart", error });
  }
};

export const getFinalReceipt = async (req, res) => {
  try {
    const { user_id } = getUserFromToken(req, res);

    if (!user_id) return res.status(400).json({ message: "no access" });

    // Fetch user's cart from the database
    const userCart = await Cart.findOne({ user_id });
    

    if (!userCart) {
      return res.status(404).json({ message: "Cart not found", cartItems: [] });
    }


    // Check if a FinalReceipt already exists for this cart
    let existingReceipt = await FinalReceipt.findOne({ reference_cart_id: userCart.cart_id });

    // If a FinalReceipt exists and isPaid is true, return it (do not create a new one)
    if (existingReceipt && existingReceipt.isPaid) {
      return res.status(200).json(existingReceipt);
    }

    // Group items by seller
    const groupedCart = {};
    userCart.cartItems.forEach((item) => {
      const sellerKey = `${item.seller.id}-${item.seller.label}`;

      if (!groupedCart[sellerKey]) {
        groupedCart[sellerKey] = {
          seller: { id: item.seller.id, label: item.seller.label },
          priceApplyEachSeller: 0,
          items: [],
        };
      }

      const itemPriceApply = item.price.regularPrice * 0.10;
      const itemWithVat = {
        ...item,
        priceWithVat: {
          regularPriceWithVat: item.price.regularPrice,
          discountPercent: item.price.discountPercent,
          discountedPriceWithVat: item.price.discountedPrice,
        },
      };
      
      groupedCart[sellerKey].items.push({ itemPriceApply, item: itemWithVat });
            groupedCart[sellerKey].priceApplyEachSeller += itemPriceApply;
    });

    let totalPriceApply = Object.values(groupedCart).reduce(
      (total, sellerGroup) => total + sellerGroup.priceApplyEachSeller,
      0
    );

    // Extract discount details from existing receipt (if any)
    const cartDiscounts = existingReceipt?.cartDiscounts || {
      discountCode: { numberDiscount: 0, percentDiscount: 0 },
    };

    const { numberDiscount = 0, percentDiscount = 0 } = cartDiscounts.discountCode;

    // Calculate final price after discounts
    let totalPriceToPay = totalPriceApply - numberDiscount;

    if (percentDiscount > 0) {
      totalPriceToPay -= (totalPriceToPay * percentDiscount) / 100;
    }

    totalPriceToPay = Math.max(totalPriceToPay, 0);

    const newReceiptId =
      existingReceipt?.receipt_id || `j2bfinalreceipt${Date.now().toString().slice(-10)}`;

    const sellersWithExtras = Object.values(groupedCart).map((sellerGroup) => {
      const existingSeller = existingReceipt?.sellers?.find(
        (s) => s.seller.id === sellerGroup.seller.id
      );

      const sellerRatio = sellerGroup.priceApplyEachSeller / totalPriceApply;

      // Apply proportional discounts
      const sellerNumberDiscount = numberDiscount * sellerRatio;
      const sellerPercentDiscount = percentDiscount;

      let sellerPriceToPay = sellerGroup.priceApplyEachSeller - sellerNumberDiscount;
      if (sellerPercentDiscount > 0) {
        sellerPriceToPay -= (sellerPriceToPay * sellerPercentDiscount) / 100;
      }
      sellerPriceToPay = Math.max(sellerPriceToPay, 0);

      return {
        ...sellerGroup,
        receipt_id_seller: `${newReceiptId}-${sellerGroup.seller.id}`,
        paymentMethod: existingSeller?.paymentMethod || {},
        isPaid: existingSeller?.isPaid ?? "unpaid",
        vatRequested: existingSeller?.vatRequested || false,
        cartDiscounts: {
          discountCode: {
            code: cartDiscounts?.discountCode?.code || "",
            numberDiscount: sellerNumberDiscount,
            percentDiscount: sellerPercentDiscount,
          },
        },
        totalPriceToPay: Math.round(sellerPriceToPay),
      };
    });

    

      

    if (!existingReceipt) {
      // If no receipt exists, create a new one
      existingReceipt = new FinalReceipt({
        user_id,
        receipt_id: newReceiptId,
        reference_cart_id: userCart.cart_id,
        isPaid: "unpaid",
        totalPriceApply,
        totalPriceToPay,
        cartDiscounts,
        sellers: sellersWithExtras,
        paymentMethod: {},
      });

      await existingReceipt.save();

    } else {
      // If receipt exists but is not paid, update it
      existingReceipt.totalPriceApply = totalPriceApply;
      existingReceipt.totalPriceToPay = totalPriceToPay;
      existingReceipt.cartDiscounts = cartDiscounts;
      existingReceipt.sellers = sellersWithExtras;
      existingReceipt.paymentMethod = existingReceipt.paymentMethod || {};

      await existingReceipt.save();
    }



    res.status(200).json(existingReceipt);


  } catch (error) {
    console.error("Error fetching final receipt:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const updateFinalReceipt = async (req, res) => {
  try {


    const { user_id } = getUserFromToken(req, res);  // This will handle token extraction and verification


    const { discountCode } = req.body;

    if (!discountCode || typeof discountCode !== "string") {
      return res.status(400).json({ message: "Discount code is required and must be a string" });
    }

    // Step 1: Find the user's Cart
    const userCart = await Cart.findOne({ user_id });
    if (!userCart) {
      return res.status(404).send()
    }

    // Step 2: Find the discount code in the database
    const discount = await DiscountCode.findOne({ code: discountCode });
    if (!discount) {
      return res.status(404).send()
    }

    // Step 3: Find the FinalReceipt using user_id and reference_cart_id
    let finalReceipt = await FinalReceipt.findOne({
      user_id,
      reference_cart_id: userCart.cart_id, // Ensure it matches the user's cart
    });

    if (!finalReceipt) {
      return res.status(404).json({ message: "Final receipt not found for the given cart" });
    }

    // Step 4: Apply the discount
    finalReceipt.cartDiscounts = {
      discountCode: {
        code: discount.code,
        numberDiscount: discount.numberDiscount || 0,
        percentDiscount: discount.percentDiscount || 0,
      },
    };

    // Step 5: Recalculate the total price after applying the discount
    let finalPriceToPay = finalReceipt.totalPriceApply;

    if (discount.numberDiscount > 0) {
      finalPriceToPay -= discount.numberDiscount;
    }
    if (discount.percentDiscount > 0) {
      finalPriceToPay -= (finalPriceToPay * discount.percentDiscount) / 100;
    }

    finalReceipt.totalPriceToPay = Math.max(0, finalPriceToPay); // Ensure it's not negative

    // Step 6: Save the updated FinalReceipt
    await finalReceipt.save();

    // res.status(201).json({
    //   message: "خطایی رخ داده است",
    //   state: "error",
    //   errors: {
    //     code: "کد نامعتبر است",
    //   },
    // });


    res.status(200).json({finalReceipt: finalReceipt, status: "OK"});



  } catch (error) {
    console.error("Error applying discount code:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const removeDiscountFinalReceipt = async (req, res) => {
  try {

    const {user_id} = getUserFromToken(req, res);


    const { discountCode } = req.body;

    if (!discountCode || typeof discountCode !== "string") {
      return res.status(400).json({ message: "Discount code is required and must be a string" });
    }

    // Step 1: Find the user's Cart
    const userCart = await Cart.findOne({ user_id });
    if (!userCart) {
      return res.status(404).send()
    }

    // Step 2: Find the FinalReceipt using user_id and reference_cart_id
    let finalReceipt = await FinalReceipt.findOne({
      user_id,
      reference_cart_id: userCart.cart_id, // Ensure it matches the user's cart
    });

    if (!finalReceipt) {
      return res.status(404).json({ message: "Final receipt not found for the given cart" });
    }

    // Step 3: Remove the discount code from the FinalReceipt
    if (finalReceipt.cartDiscounts && finalReceipt.cartDiscounts.discountCode) {
      const appliedDiscountCode = finalReceipt.cartDiscounts.discountCode.code;

      // If the discount code in the FinalReceipt matches the one provided
      if (appliedDiscountCode === discountCode) {
        finalReceipt.cartDiscounts = {}; // Remove the discount

        // Step 4: Recalculate the total price without the discount
        finalReceipt.totalPriceToPay = finalReceipt.totalPriceApply;

        // Step 5: Save the updated FinalReceipt
        await finalReceipt.save();
        
            // res.status(201).json({
    //   message: "خطایی رخ داده است",
    //   state: "error",
    //   errors: {
    //     code: "کد نامعتبر است",
    //   },
    // });

        res.status(200).json({ finalReceipt: finalReceipt, status: "OK" });
      } else {
        return res.status(400).json({ message: "Discount code does not match the applied code" });
      }
    } else {
      return res.status(404).json({ message: "No discount code applied to the final receipt" });
    }

    
  } catch (error) {
    console.error("Error removing discount code:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateFinalReceiptGateway = async (req, res) => {
  try {


    const { user_id } = getUserFromToken(req, res);  // This will handle token extraction and verification


    const { paymentMethod } = req.body; // Expect only a paymentMethod string


    if (!paymentMethod || typeof paymentMethod !== "object" || paymentMethod === null) {
      return res.status(400).json({ message: "Payment method is required and must be a string" });
    }

    // Step 1: Find the user's Cart
    const userCart = await Cart.findOne({ user_id });
    if (!userCart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Step 2: Find FinalReceipt using both user_id and reference_cart_id
    let finalReceipt = await FinalReceipt.findOne({ 
      user_id, 
      reference_cart_id: userCart.cart_id 
    });

    if (!finalReceipt) {
      return res.status(404).json({ message: "Final receipt not found for the given cart" });
    }


    // Step 3: Update payment method
    finalReceipt.paymentMethod = paymentMethod;
    finalReceipt.markModified('paymentMethod'); // 👈 This forces Mongoose to treat it as changed


    // Save updated FinalReceipt
    await finalReceipt.save();

    res.status(200).json({ message: "Payment method updated successfully", paymentMethod });

  } catch (error) {
    console.error("Error updating payment method:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export const vatRequestFinalReceipt = async (req, res) => {

  try {
    
    const { receipt_id } = req.params;


    const { receipt_id_seller, vatRequested } = req.body;

    const user = getUserFromToken(req, res);

    const { user_id } = user;

    if (!user || !user.user_id) {
      return res.status(401).json({ message: "Unauthorized or invalid token" });
    }

    const finalReceipt = await FinalReceipt.findOne({ receipt_id, user_id });

    if (!finalReceipt) {
      return res.status(404).json({ message: "Final receipt not found" });
    }

    // Find the seller entry
    const sellerIndex = finalReceipt.sellers.findIndex(
      (seller) => seller.receipt_id_seller === receipt_id_seller
    );

    if (sellerIndex === -1) {
      return res.status(404).json({ message: "Seller receipt not found" });
    }

    // Get seller object
    const seller = finalReceipt.sellers[sellerIndex];

    // Update vatRequested
    seller.vatRequested = vatRequested;

    vatRequested ? seller.vatLink = `https://example.com/vat/${receipt_id_seller}` : seller.vatLink = "";

    // Update prices in items
    const adjust = vatRequested ? 20000 : -20000;

    seller.items.forEach((entry) => {
      if (entry?.item?.priceWithVat) {
        entry.item.priceWithVat.regularPriceWithVat += adjust;
        entry.item.priceWithVat.discountedPriceWithVat += adjust;
      }
    });
    // Save the changes
    await finalReceipt.save();


    res.status(201).json({ finalReceipt, status: "OK" });
    
    
  } catch (error) {
    console.error("Error updating vat request:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
