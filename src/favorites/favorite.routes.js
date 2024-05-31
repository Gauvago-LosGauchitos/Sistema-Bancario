import express from 'express'

import {  UpdateF, deleteF, obtener, register, test } from './favorite.controller.js';

const api = express.Router();

api.get('/test', test)
api.post('/register', register)
api.delete('/deleteF/:id', deleteF )
api.get('/obtener', obtener)
api.put('/UpdateF/:id', UpdateF)

export default api