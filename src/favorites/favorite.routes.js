import express from 'express'

import {  UpdateF, deleteF, obtener, register, test } from './favorite.controller.js';
import {isAdmin ,validateJwt} from '../middlewares/validate-jwt.js'

const api = express.Router();

api.get('/test', test)
api.post('/register', [validateJwt], register)
api.delete('/deleteF/:id',  deleteF )
api.get('/obtener', [validateJwt], obtener)
api.put('/UpdateF/:id', UpdateF)

export default api