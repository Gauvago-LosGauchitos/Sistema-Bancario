import express from 'express'

import {  deleteU, getLoggedUser, listAdmin, listUsers, login, registerAd, registerC, testU, updateUserAd, updateUserSelf, findUserByUsername, uploadImage } from './user.controller.js';
import {isAdmin ,validateJwt} from '../middlewares/validate-jwt.js'

const api = express.Router();

api.get('/testU', testU)
api.post('/login', login)
api.post('/registerAd',[validateJwt, isAdmin], registerAd)
api.post('/registerC',[validateJwt, isAdmin],registerC)
api.put('/updateUAd', [validateJwt,isAdmin], updateUserAd)
api.put('/updateU', [validateJwt], updateUserSelf)
api.delete('/deleteU', [validateJwt, isAdmin],deleteU)
api.get('/getLogued', [validateJwt], getLoggedUser)
api.post('/findUserByUsername',[validateJwt, isAdmin], findUserByUsername);
api.get('/getAdmins', listAdmin)
api.get('/getUsers', listUsers)
api.post('/upload-image', [validateJwt], uploadImage);


export default api