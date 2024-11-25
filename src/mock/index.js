import appConfig from "../config/app.config";
import { createServer } from "miragejs";

import { signInUserData } from "./data/authData";
import { authFakeSMS,authFakeLogin } from "./fakeApi";
const { apiPrefix } = appConfig;

function mockRunner({ environment }) {
	return createServer({
		environment,
		seeds(server) {
			server.db.loadData({
				signInUserData,
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
			authFakeLogin(this,apiPrefix)
		},
	});
}

export default mockRunner;