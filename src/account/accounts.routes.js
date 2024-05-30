import express from 'express'

const api = express.Router();

import {  obtener, register, test } from './accounts.controller.js';

api.get('/test', test)
api.post('/register', register)
api.get('/obtener', obtener)


export default api