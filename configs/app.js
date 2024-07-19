import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import { config } from 'dotenv'
import userRoutes from '../src/user/user.routes.js'
import servicesRoutes from '../src/services/services.routes.js'
import accountsRoutes from '../src/account/accounts.routes.js'
import transferRoutes from '../src/transfer/transfer.routes.js'
import favoriteRoutes from '../src/favorites/favorite.routes.js'

// Inicialización
const app = express()
config()
const port = process.env.PORT

// Configuración de CORS
const corsOptions = {
  origin: 'https://sistema-bancario-front.vercel.app' || 'http://localhost:5173',
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))

// Aumentar el límite de tamaño de la carga útil
app.use(express.urlencoded({ extended: false, limit: '10mb' }))
app.use(express.json({ limit: '10mb' }))
app.use(helmet())
app.use(morgan('dev'))

// Declaración de rutas
app.use('/user', userRoutes)
app.use('/services', servicesRoutes)
app.use('/accounts', accountsRoutes)
app.use('/transfer', transferRoutes)
app.use('/favorite', favoriteRoutes)

export const initServer = () => {
  app.listen(port)
  console.log(`Server HTTP running in port ${port}`)
}
