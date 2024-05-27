'use strict'

//Importaciones
import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import { config } from "dotenv"
import userRoutes from '../src/user/user.routes.js'
import servicesRoutes from '../src/services/services.routes.js'
import accountsRoutes from '../src/account/accounts.routes.js'

//Inicializacion

const app = express()
    config();
    const port = process.env.PORT || 2622

    app.use(express.urlencoded({extended: false}))
    app.use(express.json())
    app.use(helmet())
    app.use(morgan('dev'))
    app.use(cors())

    //Declaracion de rutas
    app.use('/user',userRoutes)
    app.use('/services', servicesRoutes)
    app.use('/accounts', accountsRoutes)

    export const initServer = ()=>{
        app.listen(port)
        console.log(`Server HTTP running in port ${port}`)
    }