const ApiError = require('../error/ApiError')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {User} = require('../models/models')

const generateJwt = (id, name, email, role) => {
    return jwt.sign(
        {id, name, email, role},
        process.env.SECRET_KEY,
        {expiresIn: '24h'}
    )
}

class UserController {
    async registration(req, res, next) {
        const {name, email, password, role} = req.body
        if (!email || !password) {
            return next(ApiError.badRequest("Wrong password or email"))
        }
        const condidate = await User.findOne({where: {email}})
        if (condidate) {
            return next(ApiError.badRequest("User already exists"))
        }
        const hashPassword = await bcrypt.hash(password, 5)
        const user = await User.create({name, email, role, password: hashPassword})
        const token = generateJwt(user.id, user.name, user.email, user.role)
        return res.json({token})
    }

    async login(req, res, next) {
        const {email, password} = req.body
        if (!email) {
            return next(ApiError.badRequest("Email is required"));
        }
        const user = await User.findOne({where: {email}})
        if (!user) {
            return next(ApiError.badRequest("User is not found"))
        }
        let comparePassword = bcrypt.compareSync(password, user.password)
        if (!comparePassword) {
            return next(ApiError.badRequest("Password is not correct"))
        }
        const token = generateJwt(user.id, user.name, user.email, user.role)
        return res.json({token})
    }

    async change(req, res) {
        
    }

    async getOne(req, res) {
        const { id } = req.params;
        const user = await User.findOne({
            attributes: ["id", "name", "email", "dateRegistration"],
            where: { id }
        });
        return res.json(user);
    }

    async check(req, res, next) {
        const token = generateJwt(req.user.id, req.user.name, req.user.email, req.user.role)
        return res.json({token})
    }
}

module.exports = new UserController()