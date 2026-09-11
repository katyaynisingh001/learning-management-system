import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import { clerkWebhook } from './controllers/webhooks.js'
import { getUserCount } from './controllers/users.js'

// Initialize express
const app = express()

// Connect to database
await connectDB()

// Middleware
app.use(cors())

// Routes
app.get('/', (req, res) => res.send("API Working"))
app.get('/api/users/count', getUserCount)
app.post('/clerk', express.raw({ type: 'application/json' }), clerkWebhook)

// Port
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})