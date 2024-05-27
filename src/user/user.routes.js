import express from 'express'

import {  login, registerAd, registerC, testU } from './user.controller.js';
import {isAdmin ,validateJwt} from '../../middlewares/validate-jwt.js'

const api = express.Router();

api.get('/testU', testU)
api.post('/login', login)
api.post('/registerAd',[validateJwt, isAdmin], registerAd)
api.post('/registerC', registerC)

export default api