import express from 'express'

import {  register, test, listarServices, deleteS, updateS, search } from './services.controller.js';
import {validateJwt, isAdmin} from '../middlewares/validate-jwt.js'

const api = express.Router();

api.get('/test', test)
api.post('/register', register)
api.get('/listarServices', listarServices)
api.delete('/deleteS/:id', deleteS)
api.put('/updateS/:id',updateS)
api.post('/search', search)
export default api