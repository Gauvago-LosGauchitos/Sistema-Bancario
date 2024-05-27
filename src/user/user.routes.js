import express from 'express'

const api = express.Router();

import {  testU } from './user.controller.js';

api.get('/testU', testU)

export default api