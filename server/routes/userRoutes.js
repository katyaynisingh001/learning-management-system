import express from 'express'
import { syncUser } from '../controllers/userController.js'

const userRouter = express.Router()

userRouter.post('/sync', syncUser)

export default userRouter