import express from 'express'
import { upload } from '../utils/multerConfig.js';

import {  register, test, listarServices, deleteS, updateS, search } from './services.controller.js';
import {validateJwt, isAdmin} from '../middlewares/validate-jwt.js'

const api = express.Router();

api.get('/test', test)
api.post('/register', [validateJwt, isAdmin, upload.single('img')], register);
api.get('/listarServices', listarServices)
api.delete('/deleteS/:id',[validateJwt, isAdmin], deleteS)
api.put('/updateS/:id',[validateJwt, isAdmin],updateS)
api.post('/search', search)
export default api