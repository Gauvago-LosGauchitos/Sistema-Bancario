import express from 'express'

const api = express.Router();

import {  test } from './transfer.controller.js';

api.get('/test', test)

export default api