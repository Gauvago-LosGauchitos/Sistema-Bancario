import express from 'express'

const api = express.Router();

import {  test } from './services.controller.js';

api.get('/test', test)


export default api