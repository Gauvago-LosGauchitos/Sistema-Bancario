import express from 'express'
import {  buyed, deposit, getTransferHistory, test, transfer } from './transfer.controller.js';
import { validateJwt } from '../middlewares/validate-jwt.js';

const api = express.Router();

api.get('/test', test)

api.post('/transfer', [validateJwt],transfer )
api.post('/buyed',[validateJwt], buyed ) 
api.post('/deposit', deposit)
api.get('/getTransferHistory',[validateJwt], getTransferHistory)

export default api