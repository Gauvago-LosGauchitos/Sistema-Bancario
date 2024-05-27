import {initServer} from "./configs/app.js"
import {connect} from "./configs/mondongo.js"
import { defaultUser } from "./src/user/user.controller.js"

initServer()
connect()
defaultUser()