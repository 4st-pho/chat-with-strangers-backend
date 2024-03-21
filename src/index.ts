import express from 'express'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import cors from 'cors'
import uploadRoute from './routes/upload.router';
import { pairingStrangers } from './firebase_admin'


const app = express()
app.use(compression())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

// Use routes
app.use('/api/upload', uploadRoute)

setInterval(pairingStrangers, 5000);

app.listen(3000, () => {
  console.log(`Server is running on http://localhost:${3000}/`)
})
