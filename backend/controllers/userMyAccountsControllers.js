import UserMyAccount from '../models/UserMyAccount.js';
import mongoose from "mongoose";
import Order from '../models/Order.js';
import { toShamsiDate } from '../libs/convertShamsi.js';
import SingleProduct from '../models/SingleProduct.js'
import jwt from "jsonwebtoken";
import getUserFromToken from '../libs/verifyToken.js';
import UserMessage from '../models/UserMessage.js';
import Ticket from '../models/Ticket.js';
import getTeamNameFromKey from '../libs/getTeamInfo.js'
import Subscription from '../models/Subscription.js'
import UserAccounts from '../models/User.js';
import User from '../models/User.js'
import multer from "multer";
import NotificationTable from '../models/NotificationsTable.js';

const upload = multer({ storage: multer.memoryStorage() }); // just reads, doesn't store

// Get all user accounts
export const getAllUserMyAccounts = async (req, res) => {
  try {
    const accounts = await UserMyAccount.find(); // Fetch all accounts from the database
    res.status(200).json(accounts);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve user accounts", error });
  }
};

// Get a user account by ID
export const getUserMyAccountById = async (req, res) => {


    const { user_id, decoded, role } = getUserFromToken(req, res);  



    if (!user_id) {
      return res.status(400).json({ message: "User Not Found" });
    }

    const userId = user_id

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
  }

  try {
      const account = await UserMyAccount.findOne({ userId });

      if (!account) {
          return res.status(404).json({ message: "User account not found" });
      }

      // Fetch orders and format them
      const orders = await Order.find({ user_id: userId })
          .select("order_id createdAt isPaid totalPriceToPay")
          .lean();

      const formattedOrders = orders.map(order => ({
          orderId: order.order_id,
          date: toShamsiDate(order.createdAt),
          status: order.isPaid,
          totalPrice: order.totalPriceToPay
      }));

      // Find favorite products from SingleProduct collection
      const favoriteIds = account.favorites.map(fav => fav.id);
      
      
      const favoriteProducts = await SingleProduct.find({ id: { $in: favoriteIds } })
      .select("general.title combinations general.images id")
      .lean();

      // Map the favorite products to the desired structure, including prices and images
      const favoriteTitles = favoriteProducts.map(product => {
          // Ensure the combinations array and suppliers array exist
          const firstCombination = product.combinations && product.combinations[0];
          const firstSupplier = firstCombination && firstCombination.suppliers && firstCombination.suppliers[0];

          // Safely access price properties
          const regularPrice = firstSupplier ? firstSupplier.price.regularPrice : null;
          const discountedPrice = firstSupplier ? firstSupplier.price.discountedPrice : null;
          const image = product.general.images && product.general.images[0]; // First image if exists
          const id = product.id 


          return {
              title: product.general.title,
              image: image,
              price: {
                  regularPrice,
                  discountedPrice
              },
              id: id
          };
      });

      // Construct response
      const response = {
          ...account.toObject(),
          orders: formattedOrders,
          favorites: favoriteTitles // Return favorites with prices inside 'price' object
      };

      res.status(200).json(response);
  } catch (error) {
      console.error("Error fetching user account:", error);
      res.status(500).json({ message: "Failed to retrieve user account", error });
  }
};


// Create a new user account
export const createUserMyAccount = async (req, res) => {
  const { userId, phoneNumber, account_balance, all_orders, tickets, orders, favorites } = req.body;

  try {
    const newAccount = new UserMyAccount({
      userId,
      phoneNumber,
      account_balance,
      all_orders,
      tickets,
      orders,
      favorites
    });

    await newAccount.save(); // Save new account to database
    res.status(201).json({ message: "User account created successfully", account: newAccount });
  } catch (error) {
    res.status(500).json({ message: "Failed to create user account", error });
  }
};

// Update an existing user account by ID
export const updateUserMyAccount = async (req, res) => {
  const { id } = req.params;
  const { phoneNumber, account_balance, all_orders, tickets, orders, favorites } = req.body;

  try {
    const updatedAccount = await UserMyAccount.findByIdAndUpdate(
      id,
      { phoneNumber, account_balance, all_orders, tickets, orders, favorites },
      { new: true } // Return the updated document
    );

    if (!updatedAccount) {
      return res.status(404).json({ message: "User account not found" });
    }

    res.status(200).json({ message: "User account updated successfully", account: updatedAccount });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user account", error });
  }
};

// Delete a user account by ID
export const deleteUserMyAccount = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedAccount = await UserMyAccount.findByIdAndDelete(id); // Delete account by ID

    if (!deletedAccount) {
      return res.status(404).json({ message: "User account not found" });
    }

    res.status(200).json({ message: "User account deleted successfully", account: deletedAccount });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user account", error });
  }
};

// Batch import user accounts
export const batchImportUserMyAccounts = async (req, res) => {
  const myAccountData = req.body.myAccountData; // Extract user accounts array properly

  if (!Array.isArray(myAccountData) || myAccountData.length === 0) {
    return res.status(400).json({ message: "Invalid data. Expected an array of user accounts." });
  }

  try {
    // Check for missing required fields in any account (optional validation)
    const invalidAccounts = myAccountData.filter(
      (account) => !account.userId || !account.phoneNumber || !account.account_balance
    );

    if (invalidAccounts.length > 0) {
      return res.status(400).json({ message: "Some accounts are missing required fields." });
    }

    // Insert accounts into the database using insertMany
    const result = await UserMyAccount.insertMany(myAccountData);

    res.status(201).json({
      message: `${result.length} user accounts imported successfully`,
      accounts: result,
    });
  } catch (error) {
    res.status(500).json({ message: "Error importing user accounts", error });
  }
};


export const getAllUserMessages = async (req, res) => {
  try {

    
    const {user_id} = getUserFromToken(req, res);  // This will handle token extraction and verification


    // Fetch user's cart from the database
    const userMessages = await UserMessage.findOne({ userId: user_id });
    if (!userMessages) {
      return res.status(404).json({ message: "UserMessage not found", UserMessages: [] });
    }

  

    res.status(200).json({message: "OK", userMessages: userMessages});
  } catch (error) {
    console.error("Error fetching final receipt:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



// Fixed API function with correct MongoDB query structure
export const getAllUserMessageComponentByUserId = async (req, res) => {
  try {
    const { user_id } = getUserFromToken(req, res);
    
    // Get pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    // Build the correct query structure
    const baseQuery = {
      $or: [
        { userId: user_id },
        { userId: { $exists: false } },
        { userId: null }
      ]
    };

    // Add expiration filter separately (not inside $or with different types)
    const fullQuery = {
      ...baseQuery,
      $and: [
        {
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: null },
            { expiresAt: { $gte: new Date() } }
          ]
        }
      ]
    };
    
    // Query for user-specific notifications or global ones
    const notifications = await NotificationTable.find(fullQuery)
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    // Get total count for pagination info - use same query structure
    const totalCount = await NotificationTable.countDocuments(fullQuery);

    // Helper function to get safe image path
    const getSafeImagePath = (imagePath) => {
      if (!imagePath || 
          imagePath === '' || 
          imagePath === 'null' || 
          imagePath === 'undefined' ||
          (Array.isArray(imagePath) && (imagePath.length === 0 || imagePath[0] === '' || !imagePath[0]))) {
        return null;
      }
      
      if (Array.isArray(imagePath)) {
        const validPath = imagePath.find(path => path && path.trim() !== '' && path !== 'null' && path !== 'undefined');
        return validPath || null;
      }
      
      return typeof imagePath === 'string' && imagePath.trim() !== '' ? imagePath : null;
    };

    // Default SVG as base64 data URL
    const defaultImageSVG = `data:image/svg+xml;base64,${Buffer.from(`
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="16" fill="#e5e7eb"/>
        <path d="M16 8C12.6863 8 10 10.6863 10 14C10 17.3137 12.6863 20 16 20C19.3137 20 22 17.3137 22 14C22 10.6863 19.3137 8 16 8Z" fill="#9ca3af"/>
        <path d="M16 22C11.5817 22 8 25.5817 8 30H24C24 25.5817 20.4183 22 16 22Z" fill="#9ca3af"/>
        <circle cx="20" cy="12" r="4" fill="#3b82f6"/>
      </svg>
    `).toString('base64')}`;

    // Generate React.createElement calls for the notifications
    const notificationComponents = notifications
      .map((notification, index) => {
        const safeImagePath = getSafeImagePath(notification.imagePath);
        const finalImageSrc = safeImagePath || defaultImageSVG;

        // Priority indicator
        const priorityColor = {
          urgent: 'bg-red-500',
          high: 'bg-orange-500',
          normal: 'bg-blue-500',
          low: 'bg-gray-500'
        }[notification.priority] || 'bg-blue-500';

        return `
        React.createElement('div', {
          key: '${notification._id}',
          className: 'bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${notification.priority === 'urgent' ? 'border-l-4 border-l-red-500' : ''}',
          onClick: () => props.onNotificationClick('${notification._id}', ${index + 1})
        }, [
          React.createElement('div', {
            className: 'flex items-center justify-between'
          }, [
            React.createElement('div', { className: 'flex items-center flex-1' }, [
              React.createElement('img', {
                src: '${finalImageSrc}',
                alt: 'notification icon',
                className: 'w-8 h-8 rounded-full mr-3 flex-shrink-0 object-cover',
                onError: function(e) { 
                  if (e.target.src !== '${defaultImageSVG}') {
                    e.target.src = '${defaultImageSVG}'; 
                  }
                }
              }),
              React.createElement('div', { className: 'flex-1 min-w-0' }, [
                React.createElement('div', { className: 'flex items-center gap-2 mb-1' }, [
                  React.createElement('h3', {
                    className: 'text-sm font-medium text-gray-900 truncate'
                  }, '${(notification.title || 'پیام جدید').replace(/'/g, "\\'")}'),
                  ${notification.type ? `React.createElement('span', {
                    className: 'text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full'
                  }, '${notification.type}')` : 'null'}
                ]),
                React.createElement('p', {
                  className: 'text-sm text-gray-600 line-clamp-2'
                }, '${(notification.description || 'محتوای پیام در اینجا نمایش داده می‌شود').replace(/'/g, "\\'")}'),
                React.createElement('p', {
                  className: 'text-xs text-gray-400 mt-2'
                }, '${notification.createdAt ? new Date(notification.createdAt).toLocaleDateString('fa-IR') : 'امروز'}')
              ])
            ]),
            React.createElement('div', { className: 'mr-3 flex-shrink-0 flex flex-col items-center gap-2' }, [
              React.createElement('div', {
                className: 'w-2 h-2 ${priorityColor} rounded-full ${notification.isRead ? 'opacity-0' : 'opacity-100'}'
              })
            ])
          ])
        ])`
      })
      .join(",");

    const emptyState = notifications.length === 0 ? `
      React.createElement('div', { className: 'text-center py-12' }, [
        React.createElement('div', { 
          className: 'text-gray-400 text-6xl mb-4',
          style: { fontFamily: 'system-ui' }
        }, '📭'),
        React.createElement('p', { 
          className: 'text-gray-500 text-base font-medium mb-2'
        }, 'هیچ پیامی یافت نشد'),
        React.createElement('p', { 
          className: 'text-gray-400 text-sm'
        }, 'پیام‌های جدید در اینجا نمایش داده می‌شوند')
      ])
    ` : '';

    const componentString = `
      function Component(props) {
        const [showAll, setShowAll] = React.useState(false);
        const displayNotifications = showAll ? ${JSON.stringify(notifications.length)} : Math.min(5, ${JSON.stringify(notifications.length)});
        
        return React.createElement('div', { className: 'max-w-2xl mx-auto p-4' }, [
          React.createElement('div', { className: 'flex justify-between items-center mb-6' }, [
            React.createElement('h2', {
              className: 'text-xl font-bold text-gray-800'
            }, 'پیام‌های اخیر'),
            ${notifications.length > 0 ? `React.createElement('span', {
              className: 'text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full'
            }, '${notifications.length} پیام')` : 'null'}
          ]),
          ${notifications.length > 0 ? `
          React.createElement('div', { className: 'space-y-3 mb-4' }, [
            ${notificationComponents}
          ].slice(0, displayNotifications)),
          ${notifications.length > 5 ? `
          React.createElement('div', { className: 'text-center mt-6' }, [
            React.createElement('button', {
              className: 'px-6 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200',
              onClick: () => setShowAll(!showAll)
            }, showAll ? 'نمایش کمتر' : \`نمایش \${${notifications.length} - 5} پیام دیگر\`)
          ])` : 'null'}
          ` : emptyState}
        ]);
      }
    `;

    res.status(200).json({ 
      message: "OK", 
      component: componentString,
      notificationIds: notifications.map(n => n._id),
      count: notifications.length,
      totalCount: totalCount,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
        limit: limit
      },
      debug: process.env.NODE_ENV === 'development' ? {
        processedImages: notifications.map(n => ({
          id: n._id,
          original: n.imagePath,
          processed: getSafeImagePath(n.imagePath),
          final: getSafeImagePath(n.imagePath) || 'default-svg'
        })),
        queryInfo: {
          requestedUserId: user_id,
          requestedPage: page,
          requestedLimit: limit,
          skip: skip,
          foundNotifications: notifications.length,
          totalInDB: totalCount,
          queryUsed: fullQuery
        }
      } : undefined
    });

  } catch (error) {
    console.error("Error generating user message component:", error);
    res.status(500).json({ 
      message: "Internal Server Error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// Optional: Separate utility function for reuse across different components
export const createSafeImagePath = (imagePath, defaultSvg = null) => {
  const getSafeImagePath = (path) => {
    if (!path || 
        path === '' || 
        path === 'null' || 
        path === 'undefined' ||
        (Array.isArray(path) && (path.length === 0 || path[0] === '' || !path[0]))) {
      return null;
    }
    
    if (Array.isArray(path)) {
      const validPath = path.find(p => p && p.trim() !== '' && p !== 'null' && p !== 'undefined');
      return validPath || null;
    }
    
    return typeof path === 'string' && path.trim() !== '' ? path : null;
  };

  const defaultImageSVG = defaultSvg || `data:image/svg+xml;base64,${Buffer.from(`
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="16" fill="#e5e7eb"/>
      <path d="M16 8C12.6863 8 10 10.6863 10 14C10 17.3137 12.6863 20 16 20C19.3137 20 22 17.3137 22 14C22 10.6863 19.3137 8 16 8Z" fill="#9ca3af"/>
      <path d="M16 22C11.5817 22 8 25.5817 8 30H24C24 25.5817 20.4183 22 16 22Z" fill="#9ca3af"/>
      <circle cx="20" cy="12" r="4" fill="#3b82f6"/>
    </svg>
  `).toString('base64')}`;

  const safeImagePath = getSafeImagePath(imagePath);
  return safeImagePath || defaultImageSVG;
};



export const getUserMessagesModalDataByTableIndexAndRowId = async (req, res) => {
  try {
    const { user_id } = getUserFromToken(req, res); // Authenticated user

    const tableIndex = Number(req.query.tableIndex);
    const rowId = Number(req.query.rowId);
    
    if (isNaN(tableIndex) || isNaN(rowId)) {
      return res.status(400).json({ message: "Invalid tableIndex or rowId" });
    }
    

    if (!tableIndex || !rowId) {
      return res.status(400).json({ message: "Missing tableIndex or rowId in query parameters" });
    }

    // Fetch the NotificationTable document matching the tableIndex
    const notificationDoc = await NotificationTable.findOne({ tableName: tableIndex });

    if (!notificationDoc) {
      return res.status(404).json({ message: "Table not found" });
    }


    // Find the row data using rowId
    const row = notificationDoc.tableData.find(item => item.rowId === rowId);
    if (!row) {
      return res.status(404).json({ message: "Row not found in the table" });
    }


    // Use the modalData from DB in the JSX string
    const jsxString = `
      () => (
        <div style={{
          padding: "20px", 
          backgroundColor: "#fff", 
          borderRadius: "8px", 
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", 
          maxWidth: "500px", 
          margin: "0 auto", 
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}>
          <h3 style={{
            fontSize: "1.5rem", 
            color: "#333", 
            marginBottom: "15px"
          }}>
            پیام دریافتی
          </h3>
          <p style={{
            fontSize: "1rem", 
            color: "#666", 
            lineHeight: "1.5", 
            marginBottom: "10px"
          }}>
            ${row.data}
          </p>
          <p style={{
            fontSize: "1rem", 
            color: "#666", 
            lineHeight: "1.5"
          }}>
            ${row.modalData}
          </p>
        </div>
      )
    `;

    return res.status(200).json({ message: "OK", component: jsxString });

  } catch (error) {
    console.error("Error fetching modal component:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};



export const getAllUserTickets = async (req, res) => {
  try {

    
    const {user_id} = getUserFromToken(req, res);  // This will handle token extraction and verification
    
    const userTickets = await Ticket.findOne({ userId: user_id });

    
    if (!userTickets) {
      return res.status(404).json({ message: "UserMessage not found", UserMessages: [] });
    }

  

    res.status(200).json({message: "OK", userTickets: userTickets});
  } catch (error) {
    console.error("Error fetching final receipt:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const getUserTicketsById = async (req, res) => {



  const { id } = req.params; // Extract the ticket ID from the request parameters
  
  
  const {user_id} = getUserFromToken(req, res);  // This will handle token extraction and verification
  

  try {
    // Fetch the ticket details by ID
    const userTickets = await Ticket.findOne({ userId: user_id });


    if (!userTickets) {
      return res.status(404).json({ message: "Ticket not found" });
    }


    // Find the specific ticket from the array
    const ticket = userTickets.tickets.find(t => t.ticketId === id);


    // if (!ticket) {
    //   return res.status(404).json({ message: "Ticket not found in user data" });
    // }

    res.status(200).json(ticket); // Return the specific ticket only


  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({ message: "Failed to retrieve ticket", error });
  }
};

// Fixed version of getNotificationsNumber function

export const getNotificationsNumber = async (req, res) => {
  try {
    const { user_id } = getUserFromToken(req, res);
    const userId = user_id;

    // Validate userId
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID is required" 
      });
    }

    // Fixed MongoDB query - combine conditions properly
    const query = {
      isRead: false,
      $and: [
        // User-specific OR global notifications
        {
          $or: [
            { userId: userId }, // Personal notifications for this user
            { userId: { $exists: false } }, // Global notifications (field doesn't exist)
            { userId: null }, // Global notifications (field is null)
            { userId: undefined } // Global notifications (field is undefined)
          ]
        },
        // Non-expired notifications
        {
          $or: [
            { expiresAt: { $exists: false } }, // No expiration date
            { expiresAt: null }, // Expiration is null
            { expiresAt: { $gt: new Date() } } // Not expired yet
          ]
        }
      ]
    };

    const unreadCount = await NotificationTable.countDocuments(query);
    
    return res.status(200).json({
      success: true,
      unreadCount: unreadCount || 0,
      message: "Notifications count retrieved successfully"
    });

  } catch (error) {
    console.error('Error fetching notifications count:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      unreadCount: 0
    });
  }
};
// Alternative version if you need to process the notifications
export const getNotificationsNumberWithProcessing = async (userId) => {
  try {
    // Validate userId
    if (!userId) {
      return 0;
    }

    const notifications = await NotificationTable.find({
      $or: [
        { userId: userId },
        { userId: { $exists: false } },
        { userId: null }
      ],
      $and: [
        {
          $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: null },
            { expiresAt: { $gte: new Date() } }
          ]
        }
      ]
    });

    // Safe check before processing
    if (!notifications || !Array.isArray(notifications)) {
      return 0;
    }

    // Count unread notifications
    const unreadCount = notifications.filter(notification => 
      notification && !notification.isRead
    ).length;

    return unreadCount;
  } catch (error) {
    return 0;
  }
};

export const setNotificationSeen = async (req, res) => {
  try {
    const { user_id } = getUserFromToken(req, res);
    const { notificationId, isRead } = req.body;

    if (!notificationId || typeof isRead !== "boolean") {
      return res.status(400).json({ message: "Missing or invalid parameters" });
    }

    // Update the notification directly by _id
    const updateResult = await NotificationTable.updateOne(
      { _id: notificationId },
      { 
        $set: { 
          isRead: isRead,
          updatedAt: new Date()
        } 
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (updateResult.modifiedCount === 0) {
      return res.status(200).json({ 
        message: "Notification was already in the requested state",
        alreadyUpdated: true
      });
    }

    return res.status(200).json({ message: "با موفقیت به روز رسانی شد" });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ message: "Failed to update notification", error });
  }
};

export const submitNewMessageToTicket = async (req, res) => {


  const { ticketId } = req.params;
  const { user_id, name } = getUserFromToken(req, res);

  try {
    const messageText = req.body.message;
    const fileName = req.file ? req.file.originalname : "";



    const userTickets = await Ticket.findOne({ userId: user_id });
    if (!userTickets) {
      return res.status(404).json({ message: "User tickets not found" });
    }

    const ticket = userTickets.tickets.find(t => t.ticketId === ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }


    const newMessage = {
      sender: {
        role: "user",
        userId: user_id,
        name: name || "کاربر",
      },
      message: messageText,
      file: fileName, // file URL skipped since no upload is happening
    };

    ticket.messages.push(newMessage);
    ticket.updatedAt = new Date().toISOString();

    await userTickets.save();

    // res.status(401).send();

    // res.status(201).json({
    //   message: "خطایی رخ داده است",
    //   state: "error",
    //   errors: {
    //     message: "فقط کاراکترهای فارسی مجاز هستند",
    //     file: "فایل انتخابی باید کمتر از 5 مگابایت باشد",
    //   },

    // });

    return res.status(201).json({
      status: "ok", 
      state: "ok",
      ticket: ticket, 
      message: "پیام با موفقیت ثبت شد"
    
    });




  } catch (error) {
    console.error("Error submitting message to ticket:", error);
    return res.status(500).json({ message: "Failed to submit message", error });
  }
};





export const createNewUserTicket = async (req, res) => {


  const { title, department, description, ticketShortDesc } = req.body;

  console.log(req.body)


  const { user_id } = getUserFromToken(req, res); // your custom token auth

  try {
    // Find existing user document
    const userTickets = await Ticket.findOne({ userId: user_id });

    // If user doc doesn't exist, create a new one
    if (!userTickets) {
      return res.status(404).send()
    }

    // Generate a unique ticket ID (or use UUID)
    const newTicketId = `ticket${userTickets.tickets.length + 1}`;

    // Create new ticket object
    const newTicket = {
      ticketId: newTicketId,
      ticketTitle: title,
      team: department,
      teamName: getTeamNameFromKey(department), // Optional: map key to display name
      ticketDescription: ticketShortDesc,
      messages: [
        {
          sender: {
            role: "user",
            userId: user_id,
            name: userTickets.tickets[0]?.requesterName || "ناشناس", // fallback if needed
          },
          message: description,
        },
      ],
      ticketStatus: "open",
      requesterId: user_id,
      requesterName: userTickets.tickets[0]?.requesterName || "ناشناس", // reuse or fallback
      priority: "medium", // Default, can be changed
      createdAt: new Date().toLocaleDateString("fa-IR"),
      updatedAt: new Date().toLocaleDateString("fa-IR"),
    };

    // Push the new ticket into the array
    userTickets.tickets.push(newTicket);

    // Save the updated document
    await userTickets.save();


    // return res.status(200).json({
    //   "message": "خطا رخ داده است.",
    //   "state": "error",
    //   "error": {
    //       "title": "از کاراکترهای فارسی در تیتر استفاده کنید",
    //       "department": "از کاراکترهای فارسی در انتخاب بخش مربوطه استفاده کنید",
    //       "ticketShortDesc": "فقط کاراکتر فارسی مجاز هستند",
    //       "description": "از کاراکتر فارسی در توضیحات استفاده کنید",
    //   }
    // });


  return res.status(201).json({
    message: "تیکت با موفقیت ایجاد شد",
    ticket: newTicket ,
    state: "ok",
  });


  } catch (error) {
    console.error("Error creating new ticket:", error);
    res.status(500).json({ message: "Failed to create new ticket", error });
  }
};



// Get all subscription plans
export const getAllSubscriptionPlans = async (req, res) => {
  try {
    // Fetch all subscription plans from the database
    const subscriptionPlans = await Subscription.find();

    if (!subscriptionPlans || subscriptionPlans.length === 0) {
      return res.status(404).json({ message: "No subscription plans found" });
    }

    // Return the subscription plans
    res.status(200).json(subscriptionPlans);


  } catch (error) {
    console.error("Error retrieving subscription plans:", error);
    res.status(500).json({ message: "Failed to retrieve subscription plans", error });
  }
};



export const purchaseSubscriptionByModelId = async (req, res) => {
  const { modelId } = req.params;
  const { user_id } = getUserFromToken(req, res); // Assuming getUserFromToken is a function to extract the user ID from the token

  try {
    // 1. Find the subscription plan by modelId
    const subscription = await Subscription.findOne({ modelId });

    if (!subscription) {
      return res.status(404).json({
        message: 'Subscription plan not found',
      });
    }

    // 2. Calculate expiration date based on the subscription duration
    const currentDate = new Date();
    const expirationDate = new Date(currentDate.getTime() + subscription.durationDays * 24 * 60 * 60 * 1000); // Adding durationDays to current date

    // 3. Find the user account
    const userAccount = await UserAccounts.findOne({ userId: user_id });

    if (!userAccount) {
      return res.status(404).json({
        message: 'User account not found',
      });
    }

    // 4. Check if the subscription modelId already exists in the user's subscriptions
    const existingSubscription = userAccount.subscriptions[modelId]; // Check for the modelId in subscriptions object
    if (existingSubscription) {
      return res.status(400).json({
        message: 'Subscription with this modelId already exists.',
      });
    }

    // 5. If it doesn't exist, add the new subscription
    userAccount.subscriptions = userAccount.subscriptions || {};  // Ensure subscriptions is initialized as an object
    
    userAccount.subscriptions[modelId] = {
      modelId: subscription.modelId,
      expirationDate: expirationDate,
      startDate: currentDate,
    };

    
    userAccount.markModified('subscriptions');

    // Save the updated user account
    await userAccount.save();

    // 6. Respond with the updated user account and subscription info
    return res.status(200).json({
      message: 'Subscription purchased successfully',
      subscriptions: userAccount.subscriptions,
    });
  } catch (error) {
    console.error('Error purchasing subscription:', error);
    return res.status(500).json({
      message: 'An error occurred while processing the subscription',
      error: getHttpCodeMessage(500),
    });
  }
};




export const getSubscriptionPlansByUserId = async (req, res) => {
  try {
    const { user_id } = getUserFromToken(req, res);
    const userId = user_id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID not provided" });
    }

    const subscriptionPlans = await Subscription.find();
    if (!subscriptionPlans || subscriptionPlans.length === 0) {
      return res.status(404).json({ message: "No subscription plans found" });
    }

    const user = await User.findOne({ userId }); // ✅ match against your own field
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const user2 = await UserMyAccount.findOne({ userId }); // ✅ match against your own field


    const balance = user2.wallet.balance


    const userSubscriptions = user.subscriptions || {};

    const plansWithStatus = subscriptionPlans.map((plan) => {
      const isPurchased = userSubscriptions.hasOwnProperty(plan.modelId);
    
      return {

       
          modelId: plan.modelId,
          purchased: isPurchased,
    


      };
    });
    
    return res.status(200).json({subscriptions: plansWithStatus, account_balance: balance});
    
    
  } catch (error) {
    console.error("Error retrieving subscription plans:", error);
    return res.status(500).json({ message: "Failed to retrieve subscription plans", error });
  }
};

