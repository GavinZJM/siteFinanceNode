const mysql = require('mysql')
module.exports =  class MysqlDBClass {
    constructor({ dbHost, dbUserName, dbPwd, databaseName }) {
        this.dbHost = dbHost || global.$ENV.NODE_DB_HOST
        this.dbUserName = dbUserName || global.$ENV.NODE_DB_USERNAME
        this.dbName = databaseName || global.$ENV.NODE_DB_NAME
        this.dbPwd = dbPwd || global.$ENV.NODE_DB_PWD
        this.connectionImpl = null
    }
    open() {
        return new Promise((resolve, reject) => {
                this.connectionImpl = mysql.createConnection({
                    host: this.dbHost,
                    user:   this.dbUserName,
                    password: this.dbPwd,
                    database: this.dbName
                })
                this.connectionImpl.connect(err => {
                    if(err) {
                        console.error('数据库连接失败', err)
                        resolve(false)
                        return
                    }
                    console.log('数据库连接成功')
                    resolve(true)
                })
        })
    }
    close() {
        this.connectionImpl.end()
    }
}