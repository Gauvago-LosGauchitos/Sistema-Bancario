import express from 'express'

import {  deleteU, getLoggedUser, login, registerAd, registerC, testU, updateUserAd, updateUserSelf } from './user.controller.js';
import {isAdmin ,validateJwt} from '../middlewares/validate-jwt.js'

const api = express.Router();

api.get('/testU', testU)
api.post('/login', login)
api.post('/registerAd',[validateJwt, isAdmin], registerAd)
api.post('/registerC',[validateJwt, isAdmin],registerC)
api.put('/updateUAd/:id', [validateJwt,isAdmin], updateUserAd)
api.put('/updateU', [validateJwt], updateUserSelf)
api.delete('/deleteU/:id', [validateJwt],deleteU)
api.get('/getLogued', [validateJwt], getLoggedUser)

export default api