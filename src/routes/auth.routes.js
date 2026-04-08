const {Router} = require('express')
const authController = require("../controllers/auth.controller")

const authRouter = Router()

/**
 * @routes POST /api/auth/register
 * @description Register a new userModel
 * @access Public
 */
authRouter.post("/register", authController.registerUserController)


/**
 * @route POST /api/auth/login
 * @description login user with email and password
 * @access Public 
 */
authRouter.post('/login', authController.loginUserController)


/**
 * @routes GET /api/auth/loginUserController
 * @description clear token from user cookie and add the token in blacklistToken
 * @access Public
 */
authRouter.get('/logout',authController.logoutUserController)


/**
 * 
 */

module.exports = authRouter