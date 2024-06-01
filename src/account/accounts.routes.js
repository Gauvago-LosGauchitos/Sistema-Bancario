import express from 'express'

const api = express.Router();

import {  eliminarA, filterAccounts, register, searchA, test } from './accounts.controller.js';

api.get('/test', test)
api.post('/register', register)
api.delete('/eliminarA/:id', eliminarA)
api.get('/filterAccounts', filterAccounts)
api.post('/searchA', searchA)


export default api