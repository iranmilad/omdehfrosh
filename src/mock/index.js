import appConfig from "../config/app.config";
import { createServer } from "miragejs";

import { signInUserData } from "./data/authData";
import { commentTexts } from "./data/comments";
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
  AdvancedSearch
} from "./fakeApi";
const { apiPrefix } = appConfig;

function mockRunner({ environment }) {
  return createServer({
    environment,
    seeds(server) {
      server.db.loadData({
        signInUserData,
        commentTexts,
      });
    },
    routes() {
      this.urlPrefix = "";
      this.namespace = "";
      this.passthrough((request) => {
        const isExternal = request.url.startsWith("http");
        return isExternal;
      });
      this.passthrough();
      authFakeSMS(this, apiPrefix);
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
      Bootstrap(this,apiPrefix);
      Product(this,apiPrefix)
      Shop(this,apiPrefix);
      Home(this,apiPrefix);
      Upload(this,apiPrefix);
      AdvancedSearch(this,apiPrefix)
    },
  });
}

export default mockRunner;
