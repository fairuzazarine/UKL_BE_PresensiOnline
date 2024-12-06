const express = require(`express`)
const md5 = require (`md5`)
const jwt = require(`jsonwebtoken`)
const userModel = require(`../models/index`).User;
const authenticate = async (request, response) => {
    let dataLogin = {
        username: request.body.username,
        password: md5(request.body.password)
    }
    let dataUser = await userModel.findOne({ where: dataLogin})
    if(dataUser){
        let payload = JSON.stringify(dataUser)
        let secret = `mokleters`
        let token = jwt.sign(payload, secret)
        return response.json({
            success: true,
            logged: true,
            message: `Login berhasil`,
            token: token,
            data: dataUser
        })
    }
    return response.json({
        success: false,
        logged: false,
        message: `Authentication Failed. Invalid username or password`
    })
} 
const authorize = (request, response, next) => {
    let headers = request.headers.authorization
    let tokenKey = headers && headers.split(" ")[1]
    if (tokenKey == null) {
        return response.json({
            success: false,
            message: 'Unathorized User'
        })
    }
    let secret = 'mokleters'
    jwt.verify(tokenKey, secret, (error, user) =>{
        if (error) {
            return response.json({
                success: false,
                message: 'Invalid token'
            })
        }
        request.user = user;
        next();
    })

}
module.exports = {authenticate, authorize}