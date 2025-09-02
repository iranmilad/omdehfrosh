import { generateToken } from "../jwt/jwt_func.js";
import Cart from "../models/Cart.js"; // Ensure the correct path
import jwt from "jsonwebtoken";
import FinalReceipt from "../models/FinalReciept.js";
import DiscountCode from "../models/DiscountCode.js";
import getUserFromToken from "../libs/verifyToken.js";
import SingleProduct from '../models/SingleProduct.js'
import Subscription from "../models/Subscription.js";
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import UserAccount from "../models/User.js"; // Your user schema
import OrderItemJ2B from "../models/OrderItemJ2B.js";
import OrderJ2B from "../models/Orders_J2B.js"; // Your order schema


export const getCart = async (req, res) => {
  try {
    const user = getUserFromToken(req);

    if (!user || !user.user_id) {
      return res.json({ message: "Cart is empty", cart: [], total: 0 });
    }

    const { user_id } = user;

    // Find ALL basket orders for this user (one per supplier)
    const basketOrders = await OrderJ2B.find({ 
      user_id: user_id.toString(), 
      status: "basket" 
    });

    if (!basketOrders || basketOrders.length === 0) {
      return res.json({ message: "Cart is empty", cart: [], total: 0 });
    }

    const cartItems = [];
    let totalAmount = 0;

    for (const basketOrder of basketOrders) {
      // Get all order items for this basket
      const orderItems = await OrderItemJ2B.find({ order_id: basketOrder.id });

      for (const orderItem of orderItems) {
        // Group by product + combination
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

          // Find combination
          const combination = product.combinations.find(
            c => c.id.toString() === productCombination.combinationId
          );
          if (!combination) continue;

          // Find supplier
          const supplier = combination.suppliers.find(
            s => s.id === orderItem.supplier_id
          );
          if (!supplier) continue;

          // Calculate quantity (use orderItem quantity directly per basket)
          const itemQuantity = orderItem.quantity;

          // Build attributes object
          const attributes = {};
          combination.options.forEach(option => {
            if (option.type === "color") {
              attributes.color = option.value;
            } else if (option.type === "material") {
              attributes.material = option.value;
            }
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

          // Calculate total
          const itemPrice = supplier.price.discountedPrice || supplier.price.regularPrice;
          totalAmount += itemPrice * itemQuantity;
        }
      }
    }

    return res.json({
      message: "ok",
      cart: cartItems,
      total: totalAmount
    });

  } catch (error) {
    console.error("Error fetching cart:", error);
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
// Check existing basket for SAME supplier
let existingOrder = await OrderJ2B.findOne({ 
  user_id: userIdStr, 
  status: "basket", 
  supplier_id: selectedSupplier.id 
});

const orderId = existingOrder?.id || `order_${uuidv4()}`;

let order;

if (existingOrder) {
  // Update existing order
  order = await OrderJ2B.findOneAndUpdate(
    { id: existingOrder.id },
    {
      $set: {
        updatedAt: new Date()
      }
    },
    { new: true }
  );
} else {
  // Create new order for this supplier
  const orderData = {
    id: orderId,
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone_number: customerPhone,
    user_id: userIdStr,
    total_price: 0,
    total_discount: 0,
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
        orderItem.priceWithVat = itemTotalRegularPrice; // Initially same as regular price (no VAT applied yet)
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
        orderItem.priceWithVat += itemTotalRegularPrice; // Add total regular price (no VAT applied yet)
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
        vatLink: "", // Required field - empty string as default
        priceWithVat: itemTotalRegularPrice, // Required field - initially same as regular price (no VAT applied yet)
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
          updatedAt: new Date(),
          vatLink: "",

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
  const { user_id } = getUserFromToken(req, res);
    const { productId, combinationsID, seller } = req.body;

    console.log(productId, combinationsID, seller);

    // ✅ extract numeric supplier_id
    const supplier_id = typeof seller === "object" ? seller.id : seller;


  if (!productId || !combinationsID || !seller) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    // 🔹 Find the active cart (order with status "basket" and supplier)
    const order = await OrderJ2B.findOne({ user_id, status: "basket", supplier_id });
    if (!order) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // 🔹 Find the order item that matches all 3 keys
    // 🔹 Remove only the matching product_id entry
    const orderItem = await OrderItemJ2B.findOneAndUpdate(
      {
        order_id: order.id,
        supplier_id,
      },
      {
        $pull: {
          product_id: { id: productId, combinationId: combinationsID },
        },
      },
      { new: true }
    );

    if (!orderItem) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // 🔹 If no product_ids remain inside this item → delete the item itself
    if (orderItem.product_id.length === 0) {
      await OrderItemJ2B.deleteOne({ _id: orderItem._id });
    }


    // 🔹 Check if any items remain in this order
    const remainingItems = await OrderItemJ2B.find({ order_id: order.id });

    if (remainingItems.length === 0) {
      // No items left → delete the order
      await OrderJ2B.deleteOne({ id: order.id });
      return res.json({
        message: "Cart is now empty and has been deleted",
        cart: [],
      });
    }

    // 🔹 Recalculate totals
    let totalPrice = 0;
    let totalDiscount = 0;
    remainingItems.forEach((item) => {
      totalPrice += item.totalPrice;
      totalDiscount += item.discount_price;
    });

    order.total_price = totalPrice;
    order.total_discount = totalDiscount;
    await order.save();

    res.json({
      message: "Product removed successfully",
      cart: {
        order,
        items: remainingItems,
      },
    });
  } catch (error) {
    console.error("Error removing product from cart:", error);
    res.status(500).json({ message: "Error removing product from cart", error });
  }
};



export const getFinalReceipt = async (req, res) => {
  const { user_id } = getUserFromToken(req, res);

  try {
    // Find ALL basket orders for this user
    const orders = await OrderJ2B.find({ 
      user_id: user_id,
      status: "basket" 
    });
    
    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: "No basket orders found for user" });
    }

    // Find all "waiting" order items for all these orders
    const orderIds = orders.map(o => o.id);

    const orderItems = await OrderItemJ2B.find({ 
      order_id: { $in: orderIds },
      status: "waiting"
    });
    
    if (!orderItems || orderItems.length === 0) {
      return res.status(404).json({ error: "No waiting order items found" });
    }

    // Create a map of order items by order_id for easy lookup
    const orderItemsByOrderId = new Map();
    orderItems.forEach(item => {
      if (!orderItemsByOrderId.has(item.order_id)) {
        orderItemsByOrderId.set(item.order_id, []);
      }
      orderItemsByOrderId.get(item.order_id).push(item);
    });

    // Discount info (applies only if a discount_code_id exists in *any* order)
    let cartDiscounts = {
      discountCode: {
        numberDiscount: 0,
        percentDiscount: 0,
        code: ""
      }
    };
    
    for (const order of orders) {
      if (order.discount_code_id) {
        const discountCode = await DiscountCode.findById(order.discount_code_id);
        if (discountCode) {
          cartDiscounts.discountCode = {
            numberDiscount: discountCode.numberDiscount || 0,
            percentDiscount: discountCode.percentDiscount || 0,
            code: discountCode.code || ""
          };
          break; // stop at the first valid discount code
        }
      }
    }

    // Process sellers - group by supplier_id
    const sellersMap = new Map();
    
    // Init seller entries
    for (const orderItem of orderItems) {
      const supplierId = orderItem.supplier_id;
      
      if (!sellersMap.has(supplierId)) {
        sellersMap.set(supplierId, {
          seller: {
            id: supplierId,
            label: `Seller ${supplierId}` // will be updated later
          },
          vatRequested: orderItem.vatRequested || false,
          vatLink: orderItem.vatLink || "",
          isPaid: "unpaid",
          paymentComment: "",
          priceApplyEachSeller: 0,
          items: [],
          paymentMethod: orderItem.paymentMethod,
          // Add order tracking information
          orderIds: [], // Array of OrderJ2B IDs for this seller
          // orderItemIds: [] // Array of OrderItemJ2B IDs for this seller
        });
      }
    }

    // Now process each order item
    for (const orderItem of orderItems) {
      const supplierId = orderItem.supplier_id;
      const seller = sellersMap.get(supplierId);

      // Add order and order item IDs to seller
      // if (!seller.orderItemIds.includes(orderItem.id)) {
      //   seller.orderItemIds.push(orderItem.id);
      // }
      
      // Find the corresponding order and add its ID
      const correspondingOrder = orders.find(o => o.id === orderItem.order_id);
      if (correspondingOrder && !seller.orderIds.includes(correspondingOrder.id)) {
        seller.orderIds.push(correspondingOrder.id);
      }

      for (const productRef of orderItem.product_id) {
        try {
          const product = await SingleProduct.findOne({ id: productRef.id });
          if (!product) continue;
          
          const combination = product.combinations.find(c => c.id == productRef.combinationId);
          if (!combination) continue;
          
          const supplierInfo = combination.suppliers.find(s => s.id === supplierId);
          if (!supplierInfo) continue;

          // Update supplier label
          seller.seller.label = supplierInfo.name || `Seller ${supplierId}`;

          // VAT calculations
          const vatRate = 1.09;
          const regularPriceWithVat = Math.round(supplierInfo.price.regularPrice * vatRate);
          const discountedPriceWithVat = Math.round(supplierInfo.price.discountedPrice * vatRate);

          // Attributes
          const attributes = {};
          combination.options.forEach(option => {
            if (option.type === "color") attributes.color = option.value;
            if (option.type === "material") attributes.material = option.value;
          });

          const item = {
            item: {
              priceWithVat: {
                regularPriceWithVat,
                discountPercent: supplierInfo.price.discountPercent || 0,
                discountedPriceWithVat
              },
              price: {
                regularPrice: supplierInfo.price.regularPrice,
                discountPercent: supplierInfo.price.discountPercent || 0,
                discountedPrice: supplierInfo.price.discountedPrice
              },
              seller: {
                id: supplierId,
                label: supplierInfo.name || `Seller ${supplierId}`
              },
              productId: productRef.id,
              combinationsID: productRef.combinationId,
              seller_id: supplierId,
              name: product.general.title,
              image: product.general.images?.[0] || "",
              count: orderItem.quantity,
              max: supplierInfo.maxOrder || 999999,
              min: supplierInfo.minOrder || 1,
              attributes: [attributes],
              // Add order item reference
              // orderItemId: orderItem.id,
              // orderId: orderItem.order_id
            },
            itemPriceApply: orderItem.totalPrice,
            // Add order tracking at item level as well
            // orderItemId: orderItem.id,
            // orderId: orderItem.order_id
          };

          seller.items.push(item);
          seller.priceApplyEachSeller += orderItem.totalPrice;
          
        } catch (err) {
          console.error(`Error processing product ${productRef.id}:`, err);
          continue;
        }
      }
    }

    const sellers = Array.from(sellersMap.values()).filter(s => s.items.length > 0);
    if (sellers.length === 0) {
      return res.status(404).json({ error: "No valid sellers found with items" });
    }

    // Calculate totals across all orders
    const totalPrice = orders.reduce((sum, o) => sum + (o.total_price || 0), 0);
    const totalDiscount = orders.reduce((sum, o) => sum + (o.total_discount || 0), 0);

    let totalPriceToPay = totalPrice;
    if (totalDiscount) {
      totalPriceToPay = Math.max(0, totalPrice - totalDiscount);
    }

    const totalPriceApply = sellers.reduce((sum, s) => sum + s.priceApplyEachSeller, 0);

    // Collect all unique order IDs and order item IDs
    const allOrderIds = [...new Set(orders.map(o => o.id))];
    const allOrderItemIds = [...new Set(orderItems.map(oi => oi.id))];

    // Create order-item relationships array
    const orderItemRelationships = orderItems.map(orderItem => ({
      orderId: orderItem.order_id,
      // orderItemId: orderItem.id,
      supplierId: orderItem.supplier_id,
      // quantity: orderItem.quantity,
      // totalPrice: orderItem.totalPrice,
    }));

    // Build response
    const finalReceipt = {
      cartDiscounts,
      totalPriceToPay,
      user_id: parseInt(user_id),
      isPaid: "unpaid", // baskets are not paid yet
      paymentComment: "",
      sellers,
      totalPriceApply,
      
      // Updated order tracking information with relationships
        orderTracking: orderItemRelationships
      
    };

    console.log(`Final receipt generated for user ${user_id} with ${sellers.length} sellers, ${orders.length} orders, ${orderItems.length} order items`);
    res.status(200).json(finalReceipt);

  } catch (error) {
    console.error("Error in getFinalReceipt:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
};

// Alternative version that accepts order_id in request body
export const getFinalReceiptFromBody = async (req, res) => {
  try {
    const { order_id } = req.body;
    
    if (!order_id) {
      return res.status(400).json({ error: 'order_id is required' });
    }
    
    // Use the same logic as above, just replace orderId with order_id
    req.params = { orderId: order_id };
    return getFinalReceipt(req, res);
    
  } catch (error) {
    console.error('Error in getFinalReceiptFromBody:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};





// export const getFinalReceipt = async (req, res) => {
//   try {
//     const { user_id } = getUserFromToken(req, res);

//     if (!user_id) return res.status(400).json({ message: "no access" });

//     // Fetch user's cart from the database
//     const userCart = await Cart.findOne({ user_id });
    

//     if (!userCart) {
//       return res.status(404).json({ message: "Cart not found", cartItems: [] });
//     }


//     // Check if a FinalReceipt already exists for this cart
//     let existingReceipt = await FinalReceipt.findOne({ reference_cart_id: userCart.cart_id });

//     // If a FinalReceipt exists and isPaid is true, return it (do not create a new one)
//     if (existingReceipt && existingReceipt.isPaid) {
//       return res.status(200).json(existingReceipt);
//     }

//     // Group items by seller
//     const groupedCart = {};
//     userCart.cartItems.forEach((item) => {
//       const sellerKey = `${item.seller.id}-${item.seller.label}`;

//       if (!groupedCart[sellerKey]) {
//         groupedCart[sellerKey] = {
//           seller: { id: item.seller.id, label: item.seller.label },
//           priceApplyEachSeller: 0,
//           items: [],
//         };
//       }

//       const itemPriceApply = item.price.regularPrice * 0.10;
//       const itemWithVat = {
//         ...item,
//         priceWithVat: {
//           regularPriceWithVat: item.price.regularPrice,
//           discountPercent: item.price.discountPercent,
//           discountedPriceWithVat: item.price.discountedPrice,
//         },
//       };
      
//       groupedCart[sellerKey].items.push({ itemPriceApply, item: itemWithVat });
//             groupedCart[sellerKey].priceApplyEachSeller += itemPriceApply;
//     });

//     let totalPriceApply = Object.values(groupedCart).reduce(
//       (total, sellerGroup) => total + sellerGroup.priceApplyEachSeller,
//       0
//     );

//     // Extract discount details from existing receipt (if any)
//     const cartDiscounts = existingReceipt?.cartDiscounts || {
//       discountCode: { numberDiscount: 0, percentDiscount: 0 },
//     };

//     const { numberDiscount = 0, percentDiscount = 0 } = cartDiscounts.discountCode;

//     // Calculate final price after discounts
//     let totalPriceToPay = totalPriceApply - numberDiscount;

//     if (percentDiscount > 0) {
//       totalPriceToPay -= (totalPriceToPay * percentDiscount) / 100;
//     }

//     totalPriceToPay = Math.max(totalPriceToPay, 0);

//     const newReceiptId =
//       existingReceipt?.receipt_id || `j2bfinalreceipt${Date.now().toString().slice(-10)}`;

//     const sellersWithExtras = Object.values(groupedCart).map((sellerGroup) => {
//       const existingSeller = existingReceipt?.sellers?.find(
//         (s) => s.seller.id === sellerGroup.seller.id
//       );

//       const sellerRatio = sellerGroup.priceApplyEachSeller / totalPriceApply;

//       // Apply proportional discounts
//       const sellerNumberDiscount = numberDiscount * sellerRatio;
//       const sellerPercentDiscount = percentDiscount;

//       let sellerPriceToPay = sellerGroup.priceApplyEachSeller - sellerNumberDiscount;
//       if (sellerPercentDiscount > 0) {
//         sellerPriceToPay -= (sellerPriceToPay * sellerPercentDiscount) / 100;
//       }
//       sellerPriceToPay = Math.max(sellerPriceToPay, 0);

//       return {
//         ...sellerGroup,
//         receipt_id_seller: `${newReceiptId}-${sellerGroup.seller.id}`,
//         paymentMethod: existingSeller?.paymentMethod || {},
//         isPaid: existingSeller?.isPaid ?? "unpaid",
//         vatRequested: existingSeller?.vatRequested || false,
//         cartDiscounts: {
//           discountCode: {
//             code: cartDiscounts?.discountCode?.code || "",
//             numberDiscount: sellerNumberDiscount,
//             percentDiscount: sellerPercentDiscount,
//           },
//         },
//         totalPriceToPay: Math.round(sellerPriceToPay),
//       };
//     });

    

      

//     if (!existingReceipt) {
//       // If no receipt exists, create a new one
//       existingReceipt = new FinalReceipt({
//         user_id,
//         receipt_id: newReceiptId,
//         reference_cart_id: userCart.cart_id,
//         isPaid: "unpaid",
//         totalPriceApply,
//         totalPriceToPay,
//         cartDiscounts,
//         sellers: sellersWithExtras,
//         paymentMethod: {},
//       });

//       await existingReceipt.save();

//     } else {
//       // If receipt exists but is not paid, update it
//       existingReceipt.totalPriceApply = totalPriceApply;
//       existingReceipt.totalPriceToPay = totalPriceToPay;
//       existingReceipt.cartDiscounts = cartDiscounts;
//       existingReceipt.sellers = sellersWithExtras;
//       existingReceipt.paymentMethod = existingReceipt.paymentMethod || {};

//       await existingReceipt.save();
//     }



//     res.status(200).json(existingReceipt);


//   } catch (error) {
//     console.error("Error fetching final receipt:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };


export const updateFinalReceipt = async (req, res) => {
  try {
    const { user_id } = getUserFromToken(req, res);
    const { discountCode, paymentMethod } = req.body;

    // Validate required fields
    if (!discountCode) {
      return res.status(400).json({ 
        error: 'Discount code is required',
        status: 'error'
      });
    }

    // Find the user's basket order
    const order = await OrderJ2B.findOne({ 
      user_id: user_id,
      status: "basket" 
    });
    
    if (!order) {
      return res.status(404).json({ 
        error: 'No basket order found for user',
        status: 'error'
      });
    }

    // Validate the discount code
    const discount = await DiscountCode.findOne({ code: discountCode });
    if (!discount) {
      return res.status(400).json({ 
        error: 'Invalid discount code',
        status: 'error'
      });
    }

    // Check if discount code is active/valid
    if (discount.isActive === false) {
      return res.status(400).json({ 
        error: 'Discount code is not active',
        status: 'error'
      });
    }

    // Check expiration date if exists
    if (discount.expiryDate && new Date(discount.expiryDate) < new Date()) {
      return res.status(400).json({ 
        error: 'Discount code has expired',
        status: 'error'
      });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.numberDiscount) {
      discountAmount = discount.numberDiscount;
    } else if (discount.percentDiscount) {
      discountAmount = (order.total_price * discount.percentDiscount) / 100;
    }

    // Ensure discount doesn't exceed total price
    discountAmount = Math.min(discountAmount, order.total_price);

    // Update the order with discount information and payment method
    const updatedOrder = await OrderJ2B.findOneAndUpdate(
      { id: order.id },
      { 
        discount_code_id: discount._id,
        total_discount: discountAmount,
        payment_method: paymentMethod?.name || paymentMethod || order.payment_method
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(500).json({ 
        error: 'Failed to update order',
        status: 'error'
      });
    }

    // Return success response
    res.status(200).json({
      status: 'OK',
      message: 'Discount code applied successfully',
      data: {
        orderId: updatedOrder.id,
        discountCode: discountCode,
        discountAmount: discountAmount,
        totalPrice: updatedOrder.total_price,
        totalDiscount: updatedOrder.total_discount,
        finalPrice: updatedOrder.total_price - updatedOrder.total_discount,
        paymentMethod: updatedOrder.payment_method
      }
    });

  } catch (error) {
    console.error('Error in updateFinalReceipt:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      status: 'error',
      message: error.message 
    });
  }
};

export const removeDiscountFinalReceipt = async (req, res) => {
  try {
    const { user_id } = getUserFromToken(req, res);
    const { discountCode, paymentMethod } = req.body;

    

    // Validate required fields
    if (!discountCode) {
      return res.status(400).json({ 
        error: 'Discount code is required',
        status: 'error'
      });
    }

    // Find the user's basket order
    const order = await OrderJ2B.findOne({ 
      user_id: user_id,
      status: "basket" 
    });
    
    if (!order) {
      return res.status(404).json({ 
        error: 'No basket order found for user',
        status: 'error'
      });
    }

    // Verify that the discount code matches the one applied to the order
    if (order.discount_code_id) {
      const currentDiscount = await DiscountCode.findById(order.discount_code_id);
      if (!currentDiscount || currentDiscount.code !== discountCode) {
        return res.status(400).json({ 
          error: 'Discount code does not match the applied discount',
          status: 'error'
        });
      }
    } else {
      return res.status(400).json({ 
        error: 'No discount code is currently applied to this order',
        status: 'error'
      });
    }

    // Remove the discount from the order
    const updatedOrder = await OrderJ2B.findOneAndUpdate(
      { id: order.id },
      { 
        discount_code_id: null,
        total_discount: 0,
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(500).json({ 
        error: 'Failed to update order',
        status: 'error'
      });
    }

    // Return success response
    res.status(200).json({
      status: 'OK',
      message: 'Discount code removed successfully',
      data: {
        orderId: updatedOrder.id,
        removedDiscountCode: discountCode,
        totalPrice: updatedOrder.total_price,
        totalDiscount: updatedOrder.total_discount,
        finalPrice: updatedOrder.total_price - updatedOrder.total_discount,
      }
    });


  } catch (error) {
    console.error('Error in removeDiscountFinalReceipt:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      status: 'error',
      message: error.message 
    });
  }
};

export const updateFinalReceiptGateway = async (req, res) => {
  try {
    const { user_id } = getUserFromToken(req, res); // This will handle token extraction and verification

    const { paymentMethod } = req.body; // Expect only a paymentMethod string
    console.log('Payment Method:', paymentMethod);
    console.log('User ID:', user_id);

    // Validate paymentMethod
    if (!paymentMethod) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Payment method is required'
      });
    }

    // First, find all orders for this user to get order_ids
    const userOrders = await OrderJ2B.find({ user_id: user_id }).select('id');
    
    if (!userOrders || userOrders.length === 0) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'No orders found for this user'
      });
    }

    // Extract order_ids
    const orderIds = userOrders.map(order => order.id);

    // Update all OrderItemJ2B documents that belong to this user's orders
    const updateResult = await OrderItemJ2B.updateMany(
      { 
        order_id: { $in: orderIds },
        isPaid: 'unpaid' // Only update unpaid items
      },
      { 
        $set: { 
          paymentMethod: paymentMethod,
          updatedAt: new Date()
        }
      }
    );

    console.log('Update Result:', updateResult);

    // Check if any documents were modified
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'No unpaid order items found for this user'
      });
    }

    return res.status(200).json({
      status: 'OK',
      message: 'Payment method updated successfully',
      data: {
        matchedCount: updateResult.matchedCount,
        modifiedCount: updateResult.modifiedCount,
        paymentMethod: paymentMethod
      }
    });

  } catch (error) {
    console.error('Error updating payment method:', error);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Internal server error while updating payment method',
      error: error.message
    });
  }
};




// export const updateFinalReceiptGateway = async (req, res) => {
//   try {


//     const { user_id } = getUserFromToken(req, res);  // This will handle token extraction and verification


//     const { paymentMethod } = req.body; // Expect only a paymentMethod string
//     console.log(paymentMethod)


//     if (!paymentMethod || typeof paymentMethod !== "object" || paymentMethod === null) {
//       return res.status(400).json({ message: "Payment method is required and must be a string" });
//     }

//     // Step 1: Find the user's Cart
//     const userCart = await Cart.findOne({ user_id });
//     if (!userCart) {
//       return res.status(404).json({ message: "Cart not found" });
//     }

//     // Step 2: Find FinalReceipt using both user_id and reference_cart_id
//     let finalReceipt = await FinalReceipt.findOne({ 
//       user_id, 
//       reference_cart_id: userCart.cart_id 
//     });

//     if (!finalReceipt) {
//       return res.status(404).json({ message: "Final receipt not found for the given cart" });
//     }


//     // Step 3: Update payment method
//     finalReceipt.paymentMethod = paymentMethod;
//     finalReceipt.markModified('paymentMethod'); // 👈 This forces Mongoose to treat it as changed


//     // Save updated FinalReceipt
//     await finalReceipt.save();

//     res.status(200).json({ message: "Payment method updated successfully", paymentMethod });

//   } catch (error) {
//     console.error("Error updating payment method:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };


// Your API implementation
// export const vatRequestFinalReceipt = async (req, res) => {
//   try {
//     const user = getUserFromToken(req, res);
//     const { user_id } = user;
//     const { vatRequested } = req.body;

//     console.log(vatRequested)

//     // Find OrderJ2B with user_id and status "basket"
//     const order = await OrderJ2B.findOne({ 
//       user_id: user_id.toString(), 
//       status: "basket" 
//     });
    
//     if (!order) {
//       return res.status(404).json({
//         status: "ERROR",
//         message: "No basket order found for this user"
//       });
//     }
    
//     // Find all OrderItemsJ2B for this order
//     const orderItems = await OrderItemJ2B.find({ 
//       order_id: order.id 
//     });
    
//     if (orderItems.length === 0) {
//       return res.status(404).json({
//         status: "ERROR",
//         message: "No order items found for this order"
//       });
//     }
    
//     // VAT amount to add/subtract
//     const VAT_AMOUNT = 10000;
    
//     if (vatRequested) {
//       // Apply VAT - Add 10,000 to all price fields
      
//       // Update OrderJ2B price fields
//       await OrderJ2B.findOneAndUpdate(
//         { _id: order._id },
//         {
//           $inc: {
//             total_price: VAT_AMOUNT,
//             total_discount: VAT_AMOUNT
//           },
//           $set: {
//             updatedAt: new Date()
//           }
//         }
//       );
      
//       // Update each OrderItemsJ2B
//       for (const item of orderItems) {
//         await OrderItemJ2B.findOneAndUpdate(
//           { _id: item._id },
//           {
//             $inc: {
//               priceWithVat: VAT_AMOUNT,
//               price: VAT_AMOUNT,
//               discount_price: VAT_AMOUNT,
//               totalPrice: VAT_AMOUNT
//             },
//             $set: {
//               vatRequested: true,
//               updatedAt: new Date()
//             }
//           }
//         );
//       }
      
//     } else {
//       // Remove VAT - Subtract 10,000 from all price fields
      
//       // Update OrderJ2B price fields
//       await OrderJ2B.findOneAndUpdate(
//         { _id: order._id },
//         {
//           $inc: {
//             total_price: -VAT_AMOUNT,
//             total_discount: -VAT_AMOUNT
//           },
//           $set: {
//             updatedAt: new Date()
//           }
//         }
//       );
      
//       // Update each OrderItemsJ2B
//       for (const item of orderItems) {
//         await OrderItemJ2B.findOneAndUpdate(
//           { _id: item._id },
//           {
//             $inc: {
//               priceWithVat: -VAT_AMOUNT,
//               price: -VAT_AMOUNT,
//               discount_price: -VAT_AMOUNT,
//               totalPrice: -VAT_AMOUNT
//             },
//             $set: {
//               vatRequested: false,
//               vatLink: "", // Clear VAT link when removing VAT
//               updatedAt: new Date()
//             }
//           }
//         );
//       }
//     }
    
//     return res.json({
//       status: "OK",
//       message: vatRequested ? "VAT applied successfully" : "VAT removed successfully",
//       data: {
//         orderId: order.id,
//         vatRequested,
//         itemsUpdated: orderItems.length
//       }
//     });

//   } catch (error) {
//     console.error("Error in vatRequestFinalReceipt:", error);
//     return res.status(500).json({
//       status: "ERROR",
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// };
export const vatRequestFinalReceipt = async (req, res) => {
  const { user_id } = getUserFromToken(req, res);
  const { vatRequested, orderId } = req.body;

  console.log("Received orderId:", orderId);

  try {
    // Validate input
    if (typeof vatRequested !== "boolean") {
      return res.status(400).json({ error: "vatRequested must be a boolean" });
    }

    if (!orderId) {
      return res.status(400).json({ error: "orderId is required" });
    }

    // Find the order by its `id` field, for this user, with status "basket"
    const order = await OrderJ2B.findOne({
      user_id: user_id,
      status: "basket",
      id: orderId, // <-- use id instead of supplier_id
    });

    if (!order) {
      return res.status(404).json({
        error: `No basket order found for user ${user_id} and orderId ${orderId}`,
      });
    }

    // Update ONLY the order items in this order
    const updateResult = await OrderItemJ2B.updateMany(
      {
        order_id: order.id, // reference the same order
        status: "waiting",
      },
      {
        $set: {
          vatRequested: vatRequested,
          vatLink: vatRequested ? "" : "",
          updatedAt: new Date(),
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({
        error: `No order items found for orderId ${orderId}`,
      });
    }

    if (updateResult.modifiedCount === 0) {
      return res.status(400).json({
        error:
          "No changes were made - items might already have the same VAT status",
      });
    }

    console.log(
      `VAT request updated for orderId ${orderId}: vatRequested=${vatRequested}`
    );

    res.status(200).json({
      status: "OK",
      message: `VAT request ${vatRequested ? "enabled" : "disabled"} for orderId ${orderId}`,
      orderId,
      vatRequested,
      modifiedCount: updateResult.modifiedCount,
    });
  } catch (error) {
    console.error("Error in vatRequestFinalReceipt:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Alternative implementation using MongoDB aggregation pipeline
const requestFinalReceiptWithAggregation = async (req, res) => {
  try {
    const { vatRequested } = req.body;
    const VAT_AMOUNT = 10000;



    const { user_id } = getUserFromToken(req, res);

    const userId = user_id;

    // Start a MongoDB session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Find and update OrderJ2B
      const orderUpdate = await OrderJ2B.findOneAndUpdate(
        { 
          user_id: userId.toString(), 
          status: "basket" 
        },
        {
          $inc: {
            total_price: vatRequested ? VAT_AMOUNT : -VAT_AMOUNT,
            total_discount: vatRequested ? VAT_AMOUNT : -VAT_AMOUNT
          },
          updatedAt: new Date()
        },
        { 
          session,
          new: true
        }
      );
      
      if (!orderUpdate) {
        await session.abortTransaction();
        return res.status(404).json({
          status: "ERROR",
          message: "No basket order found for this user"
        });
      }
      
      // Update all OrderItemsJ2B for this order
      const itemsUpdate = await OrderItemJ2B.updateMany(
        { order_id: orderUpdate.id },
        {
          $inc: {
            priceWithVat: vatRequested ? VAT_AMOUNT : -VAT_AMOUNT,
            price: vatRequested ? VAT_AMOUNT : -VAT_AMOUNT,
            discount_price: vatRequested ? VAT_AMOUNT : -VAT_AMOUNT,
            totalPrice: vatRequested ? VAT_AMOUNT : -VAT_AMOUNT
          },
          $set: {
            vatRequested: vatRequested,
            vatLink: vatRequested ? "" : "", // Set appropriate VAT link if needed
            updatedAt: new Date()
          }
        },
        { session }
      );
      
      await session.commitTransaction();
      
      return res.json({
        status: "OK",
        message: vatRequested ? "VAT applied successfully" : "VAT removed successfully",
        data: {
          orderId: orderUpdate.id,
          vatRequested,
          itemsUpdated: itemsUpdate.matchedCount
        }
      });
      
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
    
  } catch (error) {
    console.error("Error in requestFinalReceiptWithAggregation:", error);
    return res.status(500).json({
      status: "ERROR",
      message: "Internal server error",
      error: error.message
    });
  }
};

// Fetch final receipt function
const fetchFinalReceipt = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find OrderJ2B with user_id and status "basket"
    const order = await OrderJ2B.findOne({ 
      user_id: userId.toString(), 
      status: "basket" 
    });
    
    if (!order) {
      return res.status(404).json({
        status: "ERROR",
        message: "No basket order found for this user"
      });
    }
    
    // Find all OrderItemsJ2B for this order
    const orderItems = await OrderItemJ2B.find({ 
      order_id: order.id 
    });
    
    return res.json({
      status: "OK",
      data: {
        order,
        items: orderItems,
        vatApplied: orderItems.length > 0 ? orderItems[0].vatRequested : false
      }
    });
    
  } catch (error) {
    console.error("Error in fetchFinalReceipt:", error);
    return res.status(500).json({
      status: "ERROR",
      message: "Internal server error",
      error: error.message
    });
  }
};
