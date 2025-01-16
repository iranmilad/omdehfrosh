import { AuthRoutes } from "./auth";
import {PublicRoutes} from "./public"
import {EditorRoutes} from "./editor"

export default [...AuthRoutes,...PublicRoutes,...EditorRoutes]