import express from 'express'

import {  deleteU, login, registerAd, registerC, testU } from './user.controller.js';
import {isAdmin ,validateJwt} from '../../middlewares/validate-jwt.js'

const api = express.Router();

api.get('/testU', testU)
api.post('/login', login)
api.post('/registerAd',[validateJwt, isAdmin], registerAd)
api.post('/registerC',registerC)
api.delete('/deleteU/:id', [validateJwt],deleteU)

export default api