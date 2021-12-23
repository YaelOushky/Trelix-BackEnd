const bcrypt = require('bcrypt')
const userService = require('../user/user.service')
const logger = require('../../services/logger.service')


async function login(email, password) {
    logger.debug(`auth.service - login with email: ${email}`)

    const user = await userService.getByEmail(email)
    if (!user) return Promise.reject('Invalid username or password')
    console.log('user in service', user);
    // TODO: un-comment for real login
    // console.log(password);
    // console.log(user.password);
    // const match = await bcrypt.compare(password, user.password)
    // console.log(match);
    // if (!match) return Promise.reject('Invalid username or password')

    delete user.password
    user._id = user._id.toString()
    return user
}

async function signup(user) {
    const saltRounds = 10

    logger.debug(`auth.service - signup with email: ${user.email}, fullname: ${user.fullname}`)
    if (!user.email || !user.password || !user.fullname) return Promise.reject('fullname, email and password are required!')

    // const hash = await bcrypt.hash(user.password, saltRounds)
    // user.password = hash
    return userService.add( user )
}

module.exports = {
    signup,
    login,
}