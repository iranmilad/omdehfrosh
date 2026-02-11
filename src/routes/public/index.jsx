import { useParams, Navigate } from "react-router";
import Public from "../../layouts/public"
import Page404 from "../../views/auth/404"
import Product from "../../views/public/product"
import Basket from "../../views/public/basket"
import BasketInfo from "../../views/public/basket-info"
import PaymentMethod from "../../views/public/payment-method"
import Account from "../../layouts/account"
import Account_Index from "../../views/public/account-index"
import Account_Orders from "../../views/public/account-orders"
import Account_Order from "../../views/public/account-order"
import Account_EditAccount from "../../views/public/account-editaccount"
import Account_Messages from "../../views/public/account-messages"
import Account_Message from "../../views/public/account-message"
import Account_Notifications from "../../views/public/account-notifications"
import Account_Favorite from "../../views/public/account-favorite"
import Compare from "../../views/public/compare"
import Page from "../../views/public/page"
import Seller from "../../views/public/seller"
import Seller_Home from "../../views/public/seller/home"
import Logout from "../../views/public/logout"
import Account_Newticket from "../../views/public/account-newticket"
import Shop from "../../views/public/shop"
import Home from "../../views/public/index"
import Editor from "../../views/public/editor"
import FastOrder from "../../views/public/fast-order"
import Subscription from "../../views/public/subscription"
import PaymentInfo from "../../components/payment-info"
import PaymentInfoOnline from "../../components/payment-online"
import PaymentInfoCod from "../../components/payment-info-cod"
import PaymentStatusCheck from "../../views/public/payment-checkstatus"
import MasterDashboard from "../../views/public/master-dashboard"
import AddBatchProducts from '../../views/public/master-dashboard/products/homepageproducts/addbatchproducts/index'
import Products from "../../views/public/master-dashboard/products/homepageproducts"
import AddBatchBanners from "../../views/public/master-dashboard/banners/homepagebanners/addbatchbanners"
import Banners from "../../views/public/master-dashboard/banners/homepagebanners"
import Brands from "../../views/public/master-dashboard/brands"
import AddBatchBrands from "../../views/public/master-dashboard/brands/addbatchbrands"
import Categories from "../../views/public/master-dashboard/categories/homepagecategories"
import AddBatchCategories from "../../views/public/master-dashboard/categories/homepagecategories/addbatchcategories"
import ProductComments from "../../views/public/master-dashboard/productcomments/productcomments"
import AddBatchProductComments from "../../views/public/master-dashboard/productcomments/productcomments/addbatchproductcomments"
import AddBatchMenu from "../../views/public/master-dashboard/menu/menu/addbatchmenu"
import Menu from '../../views/public/master-dashboard/menu/menu/index'
import Archives from "../../views/public/master-dashboard/archives/archives"
import AddBatchArchives from "../../views/public/master-dashboard/archives/archives/addbatcharchives"
import TrendProducts from "../../views/public/master-dashboard/trendproducts/trendproducts"
import AddBatchTrendProducts from "../../views/public/master-dashboard/trendproducts/trendproducts/addbatchtrendproducts"
import ProductGrid from '../../views/public/master-dashboard/productgrid/index'
import AddBatchProductGrids from "../../views/public/master-dashboard/productgrid/addbatchproductgrid"
import SingleProduct from "../../views/public/master-dashboard/singleproduct/singleproduct"
import AddBatchSingleProduct from "../../views/public/master-dashboard/singleproduct/singleproduct/addbatchsingleproduct"
import FastEdit from "../../views/public/fast-edit"
import FastOrderBrands from "../../views/public/master-dashboard/fastorderbrands/fastorderbrands"
import AddBatchFastOrderBrands from "../../views/public/master-dashboard/fastorderbrands/fastorderbrands/addbatchallfastorderbrands"
import FastOrderFilters from "../../views/public/master-dashboard/fastorderfilters/fastorderfilters"
import AddBatchFastOrderFilters from "../../views/public/master-dashboard/fastorderfilters/fastorderfilters/addbatchallfastorderfilters/addbatchallfastorderfilters"
import FastOrderCategories from "../../views/public/master-dashboard/fastordercategories/fastordercategories"
import AddBatchFastOrderCategories from "../../views/public/master-dashboard/fastordercategories/fastordercategories/addbatchallfastordercategories"
import FastOrderLocations from "../../views/public/master-dashboard/fastorderlocations/fastorderlocations"
import AddBatchFastOrderLocations from "../../views/public/master-dashboard/fastorderlocations/fastorderlocations/addbatchallfastorderlocations"
import FakeGateway from "../../views/public/payment-checkstatus/fake-gateway"
import Gateways from "../../views/public/master-dashboard/gateways/gateways"
import AddBatchGateways from "../../views/public/master-dashboard/gateways/gateways/addbatchgateways"
import AddBatchUserMyAccounts from "../../views/public/master-dashboard/usermyaccount/usermyaccount/addbatchusermyaccount"
import UserMyAccount from "../../views/public/master-dashboard/usermyaccount/usermyaccount"
import UserMessages from "../../views/public/master-dashboard/usermessages/usermessages"
import AddBatchUserMessages from "../../views/public/master-dashboard/usermessages/usermessages/addbatchusermessages"
import PurchasedProducts from "../../views/public/master-dashboard/purchasedProducts/purchasedproducts"
import AddBatchPurchasedProducts from "../../views/public/master-dashboard/purchasedProducts/purchasedproducts/addbatchpurchasedproducts"
import MyAccountTickets from "../../views/public/master-dashboard/tickets/tickets/myaccounttickets"
import AddBatchMyAccountTickets from "../../views/public/master-dashboard/tickets/tickets/myaccounttickets/addbatchtickets"
import Subscriptions from "../../views/public/master-dashboard/subscriptions/subscriptions"
import AddBatchSubscriptions from "../../views/public/master-dashboard/subscriptions/subscriptions/addbatchsubscriptions"
import Archive from "../../components/archive"
import ArchiveWrapper from "../../components/archivewrapper"
import CategoryFilters from "../../views/public/master-dashboard/categoryfilters/categoryfilters/categoryfilters"
import AddBatchCategoryFilters from "../../views/public/master-dashboard/categoryfilters/categoryfilters/categoryfilters/addbatchcategoryfilters"
import PaymentSellers from "../../views/public/payment-sellers"
import NotificationTables from "../../views/public/master-dashboard/notificationtables/notificationtables"
import AddBatchNotificationTables from "../../views/public/master-dashboard/notificationtables/notificationtables/addbatchnotificationtables"
import Account_Wallet from "../../views/public/account-wallet"
import PaymentInfoOnlineWallet from "../../components/payment-online-wallet"
import FakeGatewayWallet from "../../views/public/payment-checkstatus-wallet/fake-gateway"
import PaymentStatusCheckWallet from "../../views/public/payment-checkstatus-wallet"
import PriceList from "../../views/public/master-dashboard/pricelist/pricelist"
import AddBatchPriceList from "../../views/public/master-dashboard/pricelist/pricelist/addbatchpricelist"
import PriceLists from "../../views/public/pricelists"
import WideSlider from "../../views/public/master-dashboard/wideslider/homepageproducts"
import AddBatchWideslider from "../../views/public/master-dashboard/wideslider/homepageproducts/addbatchwideslider"
import AddBatchFeaturedProducts from "../../views/public/master-dashboard/featuredproducts/homepageproducts/addbatchfeaturedproducts"
import FeaturedProducts from "../../views/public/master-dashboard/featuredproducts/homepageproducts"
import Brands from "../../views/public/brands"
import BrandsData from "../../views/public/master-dashboard/brandsdata/homepagebanners"
import AddBatchBrandsData from "../../views/public/master-dashboard/brandsdata/homepagebanners/addbatchbrandsdata"
import Bootstrap from "../../views/public/master-dashboard/bootstrap/bootstrap"
import AddBatchBootstrap from "../../views/public/master-dashboard/bootstrap/bootstrap/addbatchbootstrap"
import WalletPaymentPage from "../../views/public/walletpayment"
import CODPaymentPage from "../../views/public/codpayment"
import PaymentListener from "../../views/public/payment-listener"

// /category/samsung -> /shop?brand=samsung (Shop page with brand filter)
function CategoryToShopRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/shop?brand=${encodeURIComponent(slug || "")}`} replace />;
}

// /shop/samsung -> /shop?brand=samsung (checkalllink from API)
function ShopBrandRedirect() {
  const { brand } = useParams();
  return <Navigate to={`/shop?brand=${encodeURIComponent(brand || "")}`} replace />;
}

export const PublicRoutes = [
    {
        element: <Public />,
        path: "/",
        breadcrumb: "خانه",
        children: [
            {
                path: "/master-dashboard",
                element: <MasterDashboard />,
                children: [
                {
                        path: 'brandsdata', 
                        element: <BrandsData />,
                        children: [
                            {path: "add-batch-brandsdata", element: <AddBatchBrandsData />},
                        ]
                    },
                    {
                        path: 'products', 
                        element: <Products />,
                        children: [
                            {path: "add-batch-products", element: <AddBatchProducts />},
                        ]
                    },
                {
                        path: 'bootstrap', 
                        element: <Bootstrap />,
                        children: [
                            {path: "add-batch-bootstrap", element: <AddBatchBootstrap />},
                        ]
                    },
                    {
                        path: 'banners', 
                        element: <Banners />,
                        children: [
                            {path: "add-batch-banners", element: <AddBatchBanners />},
                        ]
                    },
                    {
                        path: 'brands', 
                        element: <Brands />,
                        children: [
                            {path: "add-batch-brands", element: <AddBatchBrands />},
                        ]
                    },
                    {
                        path: 'categories', 
                        element: <Categories />,
                        children: [
                            {path: "add-batch-categories", element: <AddBatchCategories />},
                        ]
                    },
                    {
                        path: 'product-comments', 
                        element: <ProductComments />,
                        children: [
                            {path: "add-batch-product-comments", element: <AddBatchProductComments />},
                        ]
                    },
                    {
                        path: 'menu', 
                        element: <Menu />,
                        children: [
                            {path: "add-batch-menu", element: <AddBatchMenu />},
                        ]
                    },
                    {
                        path: 'archives', 
                        element: <Archives />,
                        children: [
                            {path: "add-batch-archives", element: <AddBatchArchives />},
                        ]
                    },
                    {
                        path: 'trendproducts', 
                        element: <TrendProducts />,
                        children: [
                            {path: "add-batch-trend-products", element: <AddBatchTrendProducts />},
                        ]
                    },
                    {
                        path: 'productgrids', 
                        element: <ProductGrid />,
                        children: [
                            {path: "add-batch-product-grids", element: <AddBatchProductGrids />},
                        ]
                    },
                    {
                        path: 'singleproducts', 
                        element: <SingleProduct />,
                        children: [
                            {path: "add-batch-single-product", element: <AddBatchSingleProduct />},
                        ]
                    },
                    {
                        path: 'fastorderbrands', 
                        element: <FastOrderBrands />,
                        children: [
                            {path: "add-batch-fast-order-brands", element: <AddBatchFastOrderBrands />},
                        ]
                    },
                    {
                        path: 'fastorderfilters', 
                        element: <FastOrderFilters />,
                        children: [
                            {path: "add-batch-fast-order-filters", element: <AddBatchFastOrderFilters />},
                        ]
                    },
                    {
                        path: 'fastordercategories', 
                        element: <FastOrderCategories />,
                        children: [
                            {path: "add-batch-fast-order-categories", element: <AddBatchFastOrderCategories />},
                        ]
                    },
                    {
                        path: 'fastorderlocations', 
                        element: <FastOrderLocations />,
                        children: [
                            {path: "add-batch-fast-order-locations", element: <AddBatchFastOrderLocations />},
                        ]
                    },
                    {
                        path: 'gateways', 
                        element: <Gateways />,
                        children: [
                            {path: "add-batch-gateways", element: <AddBatchGateways />},
                        ]
                    },
                    {
                        path: 'user-myaccounts', 
                        element: <UserMyAccount />,
                        children: [
                            {path: "add-batch-usermyaccounts", element: <AddBatchUserMyAccounts />},
                        ]
                    },
                    {
                        path: 'usermessages', 
                        element: <UserMessages />,
                        children: [
                            {path: "add-batch-usermessages", element: <AddBatchUserMessages />},
                        ]
                    },
                    {
                        path: 'purchasedproducts', 
                        element: <PurchasedProducts />,
                        children: [
                            {path: "add-batch-purchasedproducts", element: <AddBatchPurchasedProducts />},
                        ]
                    },
                    {
                        path: 'myaccount-tickets', 
                        element: <MyAccountTickets />,
                        children: [
                            {path: "add-batch-myaccount-tickets", element: <AddBatchMyAccountTickets />},
                        ]
                    },
                    {
                        path: 'subscriptions', 
                        element: <Subscriptions />,
                        children: [
                            {path: "add-batch-subscriptions", element: <AddBatchSubscriptions />},
                        ]
                    },
                    {
                        path: 'categoryfilters', 
                        element: <CategoryFilters />,
                        children: [
                            {path: "add-batch-CategoryFilters", element: <AddBatchCategoryFilters />},
                        ]
                    },
                    {
                        path: 'notificationtables', 
                        element: <NotificationTables />,
                        children: [
                            {path: "add-batch-notificationtables", element: <AddBatchNotificationTables />},
                        ]
                    },
                    {
                        path: 'pricelist', 
                        element: <PriceList />,
                        children: [
                            {path: "add-batch-pricelist", element: <AddBatchPriceList />},
                        ]
                    },
                    {
                        path: 'wideslider', 
                        element: <WideSlider />,
                        children: [
                            {path: "add-batch-widesliders", element: <AddBatchWideslider />},
                        ]
                    },
                    {
                        path: 'featured-products', 
                        element: <FeaturedProducts />,
                        children: [
                            {path: "add-batch-featured-products", element: <AddBatchFeaturedProducts />},
                        ]
                    },
                    {
                        path: 'featured-products', 
                        element: <FeaturedProducts />,
                        children: [
                            {path: "add-batch-featured-products", element: <AddBatchFeaturedProducts />},
                        ]
                    },
                    // {path: "edit-product", element: <EditProduct />},
                    // {path: "remove-product", element: <RemoveProduct />},
                    // {path: "get-product-by-id", element: <GetProductById />},
                    // {path: "get-all-products", element: <GetAllProducts />},
                ]
            },
            {
                path: "",
                element: <Home />
            },
            {
                path: "*",
                element: <Page404 />
            },
            {
                path: "/logout",
                element: <Logout />
            },
            {
                path: "/product/:slug",
                element: <Product />
                
            },
            // {
            //     path: "/category/:slug",
            //     element: <CategoryToShopRedirect />
            // },
            {
                path: "/basket",
                element: <Basket />
            },
            {
                path: "/basket-info",
                element: <BasketInfo />
            },
            {
                path: "/payment",
                element: <PaymentMethod />
            },
              {
                path: '/wallet-payment',
                element: <WalletPaymentPage />
            },
            {
                path: "/payment-sellers/:receipt_id",
                element: <PaymentSellers />
            },
            {
                path: "payment-statuscheck",
                element: <PaymentStatusCheck />
            },
            {
                path: "payment-statuscheck-wallet",
                element: <PaymentStatusCheckWallet />
            },
            {
                path: '/payment-info',
                element: <PaymentInfo />
            },
            {
                path: '/payment-info-online',
                element: <PaymentInfoOnline />
            },
            {
                path: '/payment-info-online-wallet',
                element: <PaymentInfoOnlineWallet />
            },
            {
                path: '/fake-gateway-wallet',
                element: <FakeGatewayWallet />
            },
            {
                path: 'payment-info-cod',
                element: <PaymentInfoCod />
            },
            {
                path: 'cod-payment',
                element: <CODPaymentPage />
            },
            {
                path: 'payment-listener',
                element: <PaymentListener />
            },
            {
                path: "/compare/:category",
                element: <Compare />
            },
            {
                path: "/page/:slug",
                element: <Page />
            },
            {
                path: "/brands/:slug",
                element: <Brands />
            },
            {

                path: "/account",
                element: <Account />,
                children: [
                    {
                        path: '',
                        element: <Account_Index />
                    },
                    {
                        path: 'orders',
                        element: <Account_Orders />,
                    },
                    {
                        path: 'orders/:id',
                        element: <Account_Order/>
                    },
                    {
                        path: 'edit-account',
                        element: <Account_EditAccount />,
                    },
                    {
                        path: 'wallet',
                        element: <Account_Wallet />,
                    },
                    {
                        path: 'tickets',
                        element: <Account_Messages />,
                    },
                    {
                        path: 'tickets/new',
                        element: <Account_Newticket />,
                    },
                    {
                        path: 'tickets/single/:id',
                        element: <Account_Message />,
                    },
                    {
                        path: 'notifications',
                        element: <Account_Notifications />,
                    },
                    {
                        path: 'favorites',
                        element: <Account_Favorite />,
                    },
                ]
            },
            {
                path: "/seller/:id",
                element: <Seller />,
            },
            {
                path: "/shop/:brand",
                element: <ShopBrandRedirect />,
            },
            {
                path: "/shop",
                element: <Shop />,
            },
            {
                path: "/pricelists",
                element: <PriceLists />,
            },
            {
                path: "/fastorder/:searchType?/:categoryName?",
                element: <FastOrder />,
            },
            {
                path: "/fastedit/:id?",
                element: <FastEdit />,
            },
            {
                path: "/subscription",
                element: <Subscription />,
            },
            {
                path: '/archive/:url', 
                element: <ArchiveWrapper />,
            },
        ]
    }
]