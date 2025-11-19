import { configureStore } from "@reduxjs/toolkit";
import basketInfo from "./basket-info.js";
import global from "./global.js";
import editor from "./editor.js";
import cart from "./cart.js";
import authReducer from './auth/authusers/auth.js';


import cartfinalreceiptReducer from "./cartfinalreceipt/cartfinalreceipt.js";

import cartFinalReceiptUpdateDiscountReducer from './cartfinalreceipt/cartfinalreceiptupdate/cartFinalReceiptUpdateDiscountSlice.js';

import cartFinalReceiptUpdateDiscountDeleteReducer from './cartfinalreceipt/cartfinalreceiptdeletediscount/cartFinalReceiptDeleteDiscountSlice.js'


import cartFinalReceiptUpdateGatewayReducer from './cartfinalreceipt/cartfinalreceiptupdategateway/cartFinalReceiptUpdateGatewaySlice.js'
import userAlertInfoReducer from "./useralertinfo.js";
import userInfoReducer from "./users/userinfo/userInfo.js";
import getPaymentLinkReducer from './payment/getpaymentlink/getPaymentLinkSlice.js';
import verifyPaymentReducer from './payment/verifypayment/verifyPaymentSlice.js'; // ✅ Import Verify Payment Reducer
import homePageProductsReducer from './master-dash/products/homepageproducts/homePageProductsSlice.js'
import homePageBannersReducer from './master-dash/banners/homepagebanners/homePageBannersSlice.js'
import homePageBrandsReducer from './master-dash/brands/hompagebrands/homePageBrandsSlice.js'
import homePageCategoriesReducer from './master-dash/categories/homepagecategories/homePageCategoriesSlice.js'
import productCommentsReducer from './master-dash/comments/productcomments/productCommentsSlice.js'
import authMasterReducer from './auth/authmaster/authMasterSlice.js'
import menuReducer from './master-dash/menu/menu/menuSlice.js'
import archivesReducer from './master-dash/archives/archives/archiveSlice.js'
import homePageTrendProductsReducer from './master-dash/trendproducts/homePageTrendProducts/homePageTrendProductsSlice.js'
import homePageProductGridsReducer from './master-dash/productgrids/homePageProductGrids/homePageProductGridsSlice.js'


import mdSingleProductReducer from './master-dash/singleproducts/singleproducts/singleProductSlice.js'
import mdUserMessagesReducer from './master-dash/usermessages/usermessages/userMessagesSlice.js'
import mdUserMyAccountTickets from './master-dash/myaccounttickets/myaccounttickets/myAccountTicketsSlice.js'
import mdSubscriptionsReducer from './master-dash/subscriptions/subscriptions/subscriptionsSlice.js'
import mdCategoryFiltersReducer from './master-dash/category/addbatchcategoryfilters/addBatchCategoryFiltersSlice.js'


import ordersReducer from './orders/orders/getorderbyid/getOrderByIDSlice.js'
import orderStatusUpdateReducer from './orders/orders/updateorderdelivered/updateOrderDeliveredSlice.js'
import getAllOrdersByUserIdReducer from './orders/orders/getallordersbyuserid/getAllOrdersByUserIdSlice.js'

import subscriptionsPlansGetReducer from './usermyaccounts/usermyaccounts/getsubscriptionplans/getSubscriptionPlansSlice.js'


import userMessagesByIdReducer from './usermyaccounts/usermyaccounts/getusermessages/getUserMessagesByIdSlice.js'

import userTicketsReducer from './usermyaccounts/usermyaccounts/getusertickets/getUserTicketsSlice.js'
import userTicketsByIdRedcuer from './usermyaccounts/usermyaccounts/getusertickets/getUserTicketById/getUserTicketByIdSlice.js'
import newUserTicketReducer from './usermyaccounts/usermyaccounts/newuserticket/newUserTicketSlice.js'


import updateUserInfoReducer from './users/updateuserinfo/updateUserInfoSlice.js'

import ticketSendMessageReducer from './usermyaccounts/usermyaccounts/newmessagetickets/newMessageTicketsSlice.js'

import singleProductReducer from './products/singleproductpage/singleProductPageGetSlice.js'
import cartUpdateReducer from './cart/cartupdate/cartUpdateSlice.js'

import getOrderByReceiptIDReducer from './orders/orders/getorderbyreceiptid/getOrderByReceiptIDSlice.js'

// fast edit data
import fastEditBrandModeDataReducer from './fastedit/fastedittabledata/fastedittablebrandmode/fastEditTableBrandModeDataSlice.js'
import fastEditCategoryModeDataReducer from './fastedit/fastedittabledata/fastedittablecategorymode/fastEditTableCategoryModeDataSlice.js'

// fast order data
import fastOrderBrandModeDataReducer from './fastorder/fastordertabledata/fastordertablebrandmode/fastOrderTableBrandModeDataSlice.js'
import fastOrderCategoryModeDataReducer from './fastorder/fastordertabledata/fastordertablecategorymode/fastOrderTableCategoryModeDataSlice.js'
import brandProductsReducer from './brands/brandproducts/brandProductsSlice.js'
import getUserMessagesModalComponentDataByUserIdReducer from './usermyaccounts/usermyaccounts/usermessagesgetcomponent/usermessagesmodalcomponentget/userMessagesModalComponentGetSlice.js'

import fastOrderPageDataBrandsReducer from './master-dash/fastorder/fastorderpagedata/fastorderpagedatabrandmode/fastorderpagedatabrands/fastOrderPageDataBrandsSlice.js'
import fastOrderPageDataBrandModeFiltersReducer from './master-dash/fastorder/fastorderpagedata/fastorderpagedatabrandmodefilters/fastOrderPageDataBrandModeFiltersSlice.js'
import getProductCommentsReducer from './products/productcomments/getproductcomments/getProductCommentsSlice.js'
import brandsDataBatchImportReducer from './master-dash/brandsdata/brandsdataSlice.js'

import addedToFavoritesReducer from './users/addedtofavorites/addedToFavoritesSlice.js'
import addToFavoritesReducer from './users/addtofavorites/addToFavoritesSlice.js'
import removeFromFavoritesReducer from './users/removeFromFavorites/removeFromFavoritesSlice.js'
import purchaseSubscriptionsReducer from './usermyaccounts/usermyaccounts/purchasesubscriptions/purchaseSubscriptionsSlice.js'
import categoryDataReducer from './category/getcategorydata/getCategoryDataSlice.js'
import notificationNumberReducer from './usermyaccounts/usermyaccounts/notifications/getnotificationnumber/getNotificationNumberSlice.js'
import setNotificationSeenReducer from './usermyaccounts/usermyaccounts/notifications/setnotificationseen/setNotificationSeenSlice.js'
import walletWithDrawalReducer from './payment/wallet/walletwithdrawal/walletWithDrawalSlice.js'
import priceListsReducer from './pricelists/priceListsSlice.js'



import fastOrderLocationsReducer from './master-dash/fastorder/fastorderpagedata/general/fastorderlocations/fastOrderLocationsSlice.js'

import gateWaysReducer from './master-dash/gateways/gateways/gateWaysSlice.js'


import notificationTablesReducer from './master-dash/notificationtables/notificationtables/notificationTablesSlice.js'


import getCompareListReducer from './compare/getcomparelist/getCompareListSlice.js'
import cartFinalReceiptRequestReducer from './cartfinalreceipt/cartfinalreceiptrequestreceipt/cartFinalReceiptRequestReceiptSlice.js'
import getPaymentLinkWalletReducer from './payment/wallet/getpaymentlinkwallet/getPaymentLinkWalletSlice.js'
import verifyPaymentLinkWalletReducer from './payment/wallet/verifypaymentwallet/verifyPaymentWalletSlice.js'
import walletPaymentStatusReducer from './payment/wallet/verifypaymentwallet/verifyPaymentWalletSlice.js'
import walletTransferReducer from './payment/wallet/wallettransfer/walletTransferSlice.js'
import submitCommentReducer from './products/productcomments/addcomments/submitCommentSlice.js'


import priceListReducer from './master-dash/pricelists/pricelists/priceListSlice.js'
import purchasedProductsReducer from './master-dash/purchasedproducts/purchasedproducts/purchasedProductsSlice.js'

import bootstrapReducer from './master-dash/bootstrap/homepagebootstrap/homePageBootstrapSlice.js'


import getSubscriptionByUserIdReducer from './usermyaccounts/usermyaccounts/getsubscriptionbyuserid/getSubscriptionByUserIdSlice.js'
import compareReducer from './compare/compare.js'

import getUserMessagesComponentByUserIdReducer from './usermyaccounts/usermyaccounts/usermessagesgetcomponent/userMessagesGetComponentSlice.js'

import gateWaysDataReducer from './gatewaysdata/gatewaysdata/gateWaysDataSlice.js'

import fastEditBrandModeReducer from "./fastedit/fasteditbrandmode/fastEditBrandModeUpdateSlice.js"; // Import your reducer

import getSubscriptionInfoReducer from './usermyaccounts/usermyaccounts/purchasesubscriptions/getsubscriptioninfo/getSubscriptionInfoSlice.js'

// user my accounts reducers
import userMyAccountsGetReducer from './usermyaccounts/usermyaccounts/getusermyaccounts/userMyAccountsGetSlice.js'

import saveFilterSettingsReducer from './savefiltersettings/saveFilterSettingsSlice.js'
import updateFilterSettingsReducer from './savefiltersettings/updatefiltersettings/updateFilterSettingsSlice.js'

import getBrandsDataReducer from './brands/getbrandsdata/getBrandsDataSlice.js'
import brandsDataReducer from './brands/getbrandsdata/getBrandsDataSlice.js'


import getFilterSettingsReducer from './savefiltersettings/getFilterSettings/getFilterSettingsSlice.js'
import fastOrderTableDataCategoryModeSavedFiltersReducer from './fastorder/fastordertabledata/fastordertabledatacategorymodesavedfilters/fastOrderTableDataCategoryModeSavedFiltersSlice.js';

import stockAlertReducer from './users/userstockaler/userStockAlertInfoSlice.js'

import fastOrderTableDataBrandModeSavedFiltersReducer from './fastorder/fastordertabledata/fastordertabledatabrandmodesavedfilters/fastOrderTableDataBrandModeSavedFiltersSlice.js'

import cartDataReducer from './cart/cartdata/cartDataGetSlice.js'

import userMessagesGetComponentReducer from './usermyaccounts/usermyaccounts/usermessagesgetcomponent/userMessagesGetComponentSlice.js'
import userMessagesModalComponentGetReducer from './usermyaccounts/usermyaccounts/usermessagesgetcomponent/usermessagesmodalcomponentget/userMessagesModalComponentGetSlice.js'
import shopHomeReducer from './shophome/shopHomeSlice.js'
import getUserFavoritesListReducer from './users/getuserfavouriteslist/listSlice.js'
import searchReducer from './search/searchSlice.js'




export default configureStore({
    reducer: {
      basketInfo,
      global,
      editor,
      cart,
      cartData: cartDataReducer,
      auth: authReducer,
      authMaster: authMasterReducer,
      cartfinalreceipt: cartfinalreceiptReducer,
      cartFinalReceiptUpdateDiscount: cartFinalReceiptUpdateDiscountReducer,
      cartFinalReceiptUpdateDiscountDelete: cartFinalReceiptUpdateDiscountDeleteReducer,
      cartFinalReceiptUpdateGateway: cartFinalReceiptUpdateGatewayReducer,
      shopHome: shopHomeReducer, // Add this line
      
      // website
      userAlertInfo: userAlertInfoReducer,
      user: userInfoReducer,
      updateUserInfo: updateUserInfoReducer,
      getPaymentLink: getPaymentLinkReducer,
      verifypayment: verifyPaymentReducer,
      getSubscriptionInfo: getSubscriptionInfoReducer,
      singleProduct: singleProductReducer,
      orders: ordersReducer,
      orderStatusUpdate: orderStatusUpdateReducer,
      getAllOrdersByUserId: getAllOrdersByUserIdReducer,
      userMessagesById: userMessagesByIdReducer,
      userTickets: userTicketsReducer,
      userTicketsById: userTicketsByIdRedcuer,
      newUserTicket: newUserTicketReducer,
      getProductComments: getProductCommentsReducer,
      addedToFavorites: addedToFavoritesReducer,
      addToFavorites: addToFavoritesReducer,
      removeFromFavorites: removeFromFavoritesReducer,
      subscriptionsPlansGet: subscriptionsPlansGetReducer,
      purchaseSubscriptions: purchaseSubscriptionsReducer,
      cartUpdate: cartUpdateReducer,
      getSubscriptionByUserId: getSubscriptionByUserIdReducer,
      categoryData: categoryDataReducer,
      compare: compareReducer,
      getCompareList: getCompareListReducer,
      getOrderByReceiptID: getOrderByReceiptIDReducer,
      stockAlert: stockAlertReducer,
      getUserFavoritesList: getUserFavoritesListReducer,
      brandProducts: brandProductsReducer,
      search: searchReducer,


      submitComments: submitCommentReducer,

      cartFinalReceiptRequest: cartFinalReceiptRequestReducer,
      ticketSendMessage: ticketSendMessageReducer,
      getUserMessagesComponentByUserId: getUserMessagesComponentByUserIdReducer,
      getUserMessagesModalComponentDataByUserId: getUserMessagesModalComponentDataByUserIdReducer,
      notificationNumber: notificationNumberReducer,
      setNotificationSeen: setNotificationSeenReducer,
      getPaymentLinkWallet: getPaymentLinkWalletReducer,
      verifyPaymentLink: verifyPaymentLinkWalletReducer,
      walletPaymentStatus: walletPaymentStatusReducer,
      walletWithDrawal: walletWithDrawalReducer,

      walletTransfer: walletTransferReducer,

      userMessagesGetComponent: userMessagesGetComponentReducer,
      userMessagesModalComponentGet: userMessagesModalComponentGetReducer,
    

      // master dashboard
      homePageProducts: homePageProductsReducer,
      homePageBanners: homePageBannersReducer,
      homePageBrands: homePageBrandsReducer,
      homePageCategories: homePageCategoriesReducer,
      productComments: productCommentsReducer,
      mdSubscriptions: mdSubscriptionsReducer,
      menu: menuReducer,
      bootstrap: bootstrapReducer,
      archives: archivesReducer,
      homePageTrendProducts: homePageTrendProductsReducer,
      homePageProductGrids: homePageProductGridsReducer,
      mdSingleProductReducer: singleProductReducer,
      mdUserMyAccountTickets: mdUserMyAccountTickets,
      userMessages: mdUserMessagesReducer,
      purchasedProducts: purchasedProductsReducer,
      categoryFilters: mdCategoryFiltersReducer, 
      notificationTables: notificationTablesReducer,
      priceList: priceListReducer,
      priceLists: priceListsReducer,
      brandsDataBatchImport: brandsDataBatchImportReducer,

      // fast edit
      fastEditBrandModeData: fastEditBrandModeDataReducer,
      fastEditCategoryModeData: fastEditCategoryModeDataReducer,

      // fast order
      fastOrderBrandModeData: fastOrderBrandModeDataReducer,
      fastOrderCategoryModeData: fastOrderCategoryModeDataReducer,



      fastOrderBrandModePageDataBrandsData: fastOrderPageDataBrandsReducer,
      fastOrderPageDataBrandModeFilters: fastOrderPageDataBrandModeFiltersReducer,

      
      fastOrderLocations: fastOrderLocationsReducer,

      gateWays: gateWaysReducer,

      gateWaysData: gateWaysDataReducer,

      fastEditBrandMode: fastEditBrandModeReducer,


      // user my accounts
      userMyAccounts: userMyAccountsGetReducer,
      saveFilterSettings: saveFilterSettingsReducer,
      getFilterSettings: getFilterSettingsReducer,
      fastOrderTableDataBrandModeSavedFilters: fastOrderTableDataBrandModeSavedFiltersReducer,
      fastOrderTableDataCategoryModeSavedFilters: fastOrderTableDataCategoryModeSavedFiltersReducer,
      updateFilterSettings: updateFilterSettingsReducer,
      getBrandsData: getBrandsDataReducer,

      brandsData: brandsDataReducer, // This creates state.brandsData


    },
    devTools: process.env.NODE_ENV === "development",
  });
  