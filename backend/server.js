import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import connectDB from "./db/db.js";
import { getCart, removeFromCart, updateCart } from '../backend/controllers/cartControllers.js'
import "dotenv/config"; // No need for .config()
import cors from "cors";
import cartRoutes from "./routes/cartRoutes.js"; 
import authRoutes from "./routes/authRoutes.js"; 
import userRoutes from "./routes/userRoutes.js";
import purchasedProducts from "./routes/purchasedProductsRoutes.js"; 
import smsRoutes from "./routes/smsRoutes.js"; 
import discountCodeRoutes from './routes/discountCodeRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js' 
import productRoutes from './routes/productRoutes.js'
import bannerRoutes from './routes/master-dashboard/bannerRoutes.js'
import brandRoutes from './routes/master-dashboard/brandRoutes.js'
import mdcategoryRoutes from './routes/master-dashboard/categoryRoutes.js'
import commentsRoutes from './routes/commentRoutes.js'
import menuRoutes from './routes/master-dashboard/menuRoutes.js'
import archiveRoutes from './routes/master-dashboard/archiveRoutes.js'
import trendProductsRoutes from './routes/master-dashboard/trendProductsRoutes.js'
import productGridRoutes from './routes/master-dashboard/productGridRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import singleProductRoutes from './routes/singleProductRoutes.js'
import mdPriceListRoutes from './routes/master-dashboard/priceListRoutes.js'



// fast edit routes
import fastEditBrandModeRoutes from './routes/fastEditBrandModeTableDataRoutes.js'
import fastEditCategoryModeRoutes from './routes/fastEditCategoryModeTableDataRoutes.js'

// fast order routes
import fastOrderBrandModeRoutes from './routes/fastOrderBrandModeTableDataRoutes.js'
import fastOrderCategoryModeRoutes from './routes/fastOrderCategoryModeTableDataRoutes.js'


import fastOrderCategoryModePageDataCategoriesRoutes from './routes/fastOrderCategoryModePageDataRoutes.js'


import fastOrderBrandModePageDataRoutes from './routes/master-dashboard/fastOrderBrandModePageDataRoutes.js'
import fastOrderBrandModePageDataFiltersRoutes from './routes/master-dashboard/fastOrderPageDataBrandModeFiltersRoutes.js'


import mdCommentsRoutes from './routes/master-dashboard/commentRoutes.js'
import mdUserMessagesRoutes from './routes/master-dashboard/userMessagesRoutes.js'
import mdSingleProductRoutes from './routes/master-dashboard/singleProductRoutes.js'
import mdTicketsRoutes from './routes/master-dashboard/ticketsRoutes.js'
import mdSubscriptionsRoutes from './routes/master-dashboard/subscriptionsRoutes.js'
import mdNotificationTablesRoutes from './routes/master-dashboard/notificationTablesRoutes.js'
import mdBrandsDataRoutes from './routes/master-dashboard/brandsdataRoutes.js'

import mdPurchasedProductsRoutes from './routes/master-dashboard/purchasedProductsRoutes.js'
import fastOrderLocations from './routes/master-dashboard/fastOrderLocationsRoutes.js'
import gateWaysRoutes from './routes/master-dashboard/gateWaysRoutes.js';
import gateWaysDataRoutes from './routes/gateWaysDataRoutes.js';
import fastEditRoutes from './routes/fastEditRoutes.js'
import userMyAccountsRoutes from './routes/userMyAccountsRoutes.js'
import userMessagesRoutes from './routes/userMessagesRoutes.js'
import homePageRoutes from './routes/homePageRoutes.js'
import compareListRoutes from './routes/compareRoutes.js'
import brandsPageDataRoutes from './routes/brandspagedataRoutes.js'

import saveFilterSettingsRoutes from './routes/filterSettingsRoutes.js' 

import mdWideSliderRoutes from './routes/master-dashboard/wideSliderRoutes.js'

import mdFPRoutes from './routes/master-dashboard/fpRoutes.js'

import orderRoutes from "./routes/ordersRoutes.js"


import checkedRowsTableDataRoutes from "./routes/checkedRowsTableDataRoutes.js"

import homeRoutes from './routes/homePageRoutes.js'
import brandsRoutes from './routes/brandsRoutes.js'


dotenv.config();

connectDB();


// CORS options
const corsOptions = {
  origin: 'http://localhost:3000', // Allow frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Include OPTIONS
  allowedHeaders: ['Content-Type', 'Authorization'], // Ensure 'Content-Type' is allowed
  // credentials: true, // Allow cookies
  optionSuccessStatus:200

};


// Handle Preflight Requests (Important)

const app = express();


app.use(cors(corsOptions));
app.use(cookieParser());

app.options('*', cors(corsOptions));



app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/cart", cartRoutes); // ✅ Routes should come after middleware

// Routes
// cart routes
app.get("/cart", getCart);


app.post("/cart/update", updateCart);

// auth routes
app.use("/api/auth", authRoutes); 

// user routes
app.use("/api/users", userRoutes); 
app.use("/api/homepage", homeRoutes); 

// sms routes
app.use("/api/sms", smsRoutes); 

// user purchased products
app.use("/api/purchasedproducts", purchasedProducts); 

// discount code routes
app.use("/api/discount", discountCodeRoutes); // Use discount code routes

// payment routes
app.use("/api/payment", paymentRoutes); // Use discount code routes


app.use("/fetch-table-by-ids", checkedRowsTableDataRoutes);

app.use("/api/brandspagedata", brandsPageDataRoutes)

// product routes
app.use("/api/products", productRoutes); // Use product routes

app.use("/api/comparelist", compareListRoutes)

// order routes
app.use("/api/orders", orderRoutes)

// comment routes
app.use("/api/product-comments", commentsRoutes); // Use product routes

// app.use("/api/user-account/user-messages", userMessagesRoutes)


// fast edit brand mode data routes
app.use("/api/fast-edit-brand-mode", fastEditBrandModeRoutes)

// fast order edit mode data routes
app.use('/api/fast-edit-category-mode', fastEditCategoryModeRoutes);


// fast order brand mode data routes
app.use("/api/fast-order-brand-mode", fastOrderBrandModeRoutes)

// fast order category mode data routes
app.use('/api/fast-order-category-mode', fastOrderCategoryModeRoutes);


// payment routes
app.use('/api/gatewaysdata', gateWaysDataRoutes);

app.use('/api/fastedit', fastEditRoutes);


// user my accounts routes
app.use('/api/user-myaccounts', userMyAccountsRoutes)

app.use('/api/save-filters', saveFilterSettingsRoutes)




// homepage
app.use('/api/homepage', homePageRoutes)


// app.use('/api/notifications', notificationRoutes)


app.use('/api/category', categoryRoutes)


// single product routes

app.use("/api/singleproduct", singleProductRoutes)


// *** Master Dash Routes *** //

// single product routes
app.use("/api/master-dash/singleproducts", mdSingleProductRoutes)

app.use("/api/master-dash/user-messages", mdUserMessagesRoutes)

app.use("/api/master-dash/notification-tables", mdNotificationTablesRoutes)

// gateways routes
app.use('/api/master-dash/gateways', gateWaysRoutes);

app.use('/api/master-dash/pricelist', mdPriceListRoutes);

app.use('/api/master-dash/widesliders', mdWideSliderRoutes)

app.use('/api/master-dash/featuredproducts', mdFPRoutes)

// purchased products routes
app.use('/api/master-dash/purchasedproducts', mdPurchasedProductsRoutes)

// banner routes
app.use("/api/master-dash/banners", bannerRoutes); // Use product routes

// brand routes
app.use("/api/master-dash/brands", brandRoutes); // Use product routes

app.use("/api/brands", brandsRoutes)


// tickets routes
app.use("/api/master-dash/tickets", mdTicketsRoutes); // Use product routes


// category routes
app.use("/api/master-dash/categories", mdcategoryRoutes); // Use product routes

app.use("/api/master-dash/brandsdata", mdBrandsDataRoutes); // Use product routes

// comment routes
app.use("/api/master-dash/product-comments", mdCommentsRoutes); // Use product routes

// subscriptions routes
app.use("/api/master-dash/subscriptions", mdSubscriptionsRoutes); // Use product routes

// menu routes
app.use("/api/master-dash/menu", menuRoutes); // Use menu routes


// archive routes
app.use("/api/master-dash/archives", archiveRoutes)


// trend products routes
app.use("/api/master-dash/trendproducts", trendProductsRoutes)


// product grid routes
app.use("/api/master-dash/productgrids", productGridRoutes)



// fast order brand mode page data routes
app.use('/api/master-dash/fast-order-brand-mode-page-data', fastOrderBrandModePageDataRoutes);

// fast order brand mode page data filters routes
app.use('/api/master-dash/fast-order-brand-mode-page-data-filters', fastOrderBrandModePageDataFiltersRoutes);

// fast order category mode page data categories routes
app.use('/api/master-dash/fast-order-category-mode-page-data', fastOrderCategoryModePageDataCategoriesRoutes);

// fast order category mode page data categories routes
app.use('/api/master-dash/fast-order-locations', fastOrderLocations);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
