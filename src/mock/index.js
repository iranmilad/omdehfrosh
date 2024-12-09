import appConfig from "../config/app.config";
import { createServer } from "miragejs";

import { signInUserData } from "./data/authData";
import { SearchData } from "./data/search";
import { authFakeSMS,authFakeLogin,SearchApi } from "./fakeApi";
const { apiPrefix } = appConfig;

function mockRunner({ environment }) {
	return createServer({
		environment,
		seeds(server) {
			server.db.loadData({
				signInUserData,
				SearchData
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
			authFakeLogin(this,apiPrefix);
			SearchApi(this,apiPrefix)
		},
	});
}

export default mockRunner;