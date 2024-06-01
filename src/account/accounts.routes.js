import express from 'express'

const api = express.Router();

import {  eliminarA, filterAccounts, register, test } from './accounts.controller.js';

api.get('/test', test)
api.post('/register', register)
api.delete('/eliminarA/:id', eliminarA)
api.get('/filterAccounts', filterAccounts)


export default api