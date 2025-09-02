import appConfig from "../config/app.config";
import { createServer, Model } from "miragejs";

import { user } from "./data/authData";
import {
  authFakeSMS,
  authFakeLogin,
  SearchApi,
  SubmitCoupon,
  EditAccount,
  Account_Tickets,
  Account_Notifications,
  Favorites,
  Compare,
  Page,
  Seller,
  Bootstrap,
  Product,
  Shop,
  Home,
  Upload,
  AdvancedSearch,
  Cart,
  Fastorder,
  Orders,
  MyAccount,
  
} from "./fakeApi";
import Users from "./fakeApi/users.js";
import PurchasedProducts from "./fakeApi/purchasedproducts.js";


const { apiPrefix } = appConfig;

function mockRunner({ environment }) {
  return createServer({
    environment,
    models:{
      users: Model,
      carts: Model
    },
    seeds(server) {
      server.create('user', user);
    },
    routes() {
      this.passthrough("https://panel.j2b.market/**");

      this.passthrough('http://localhost:5000/api/***');
      this.passthrough('http://localhost:5000/api/cart/update');
      this.passthrough('http://localhost:5000/api/cart');
      this.passthrough('http://localhost:5000/api/purchasedproducts');
      this.passthrough('http://localhost:5000/api/auth/login');
      this.passthrough('http://localhost:5000/api/users/***');
      this.passthrough('http://localhost:5000/api/products/***');


      this.passthrough("/api/auth/sms/");
      this.passthrough("/api/auth/sms");

      // this.passthrough('http://localhost:5000/api/users');
      // this.passthrough('http://localhost:5000/api/users/add');

      
      this.passthrough((request) => {
        const isExternal = request.url.startsWith("http");
        return isExternal;
      });
      this.passthrough();
      // authFakeSMS(this, apiPrefix);
      authFakeLogin(this, apiPrefix);
      SearchApi(this, apiPrefix);
      SubmitCoupon(this, apiPrefix);
      EditAccount(this, apiPrefix);
      Account_Tickets(this, apiPrefix);
      Account_Notifications(this, apiPrefix);
      Favorites(this, apiPrefix);
      Compare(this, apiPrefix);
      Page(this, apiPrefix);
      Seller(this,apiPrefix);
      // Bootstrap(this,apiPrefix);
      Product(this,apiPrefix)
      Shop(this,apiPrefix);
      Home(this,apiPrefix);
      Upload(this,apiPrefix);
      AdvancedSearch(this,apiPrefix);
      Cart(this,apiPrefix);
      PurchasedProducts(this, apiPrefix);
      Users(this, apiPrefix);
      Fastorder(this,apiPrefix);
      Orders(this,apiPrefix);
      MyAccount(this,apiPrefix)
    },
  });
}

export default mockRunner;
