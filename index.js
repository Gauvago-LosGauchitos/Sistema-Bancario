import {initServer} from "./configs/app.js"
import {connect} from "./configs/mondongo.js"
import { defaultUser } from "./src/user/user.controller.js"
import {defaultServices} from "./src/services/services.controller.js"

initServer()
connect()
defaultUser()
defaultServices()