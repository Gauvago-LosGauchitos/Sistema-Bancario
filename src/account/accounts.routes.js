import express from 'express'

const api = express.Router();

import {  register, test } from './accounts.controller.js';

api.get('/test', test)
api.post('/register', register)


export default api