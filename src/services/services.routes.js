import express from 'express'

import {  register, test } from './services.controller.js';

const api = express.Router();

api.get('/test', test)
api.post('/register', register)


export default api