import express from 'express'
import {  buyed, test, transfer } from './transfer.controller.js';
import { validateJwt } from '../middlewares/validate-jwt.js';

const api = express.Router();

api.get('/test', test)

api.post('/transfer', [validateJwt],transfer )
api.post('/buyed',[validateJwt], buyed ) 

export default api