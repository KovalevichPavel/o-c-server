const {Sequelize} = require('sequelize')

module.exports = new Sequelize (
    process.env.MYSQLDATABASE,
    process.env.MYSQLUSER,
    process.env.MYSQLPASSWORD,
    {
        dialect: 'mysql',
        host: process.env.MYSQLHOST,
        port: process.env.MYSQLPORT
    }
)