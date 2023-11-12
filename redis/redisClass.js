const redis = require('redis')
module.exports =  class RedisClass {
    constructor() {
        this.redisClient = null
    }
    open() {
        return new Promise((resolve, reject) => {
            this.redisClient = redis.createClient({
                host: global.$ENV.NODE_REDIS_HOST,
                port: global.$ENV.NODE_REDIS_PORT
            })
            this.redisClient.on('connect', () => {
                console.log('connected to redis')
                resolve(true)
            })
            this.redisClient.on('error', (e) => {
                console.error('redis连接报错', e)
            })
        })
    }
    close() {}
    get({
        key
    }){
        return new Promise((resolve, reject) => {
            this.redisClient.get(key, (error, result) => {
                if(error) {
                    console.error('get redis error', error)
                    reject(error)
                } else {
                    resolve(result)
                }
            })
        })
    }
    set({
        key, value, expireTime
    }){
        return new Promise((resolve, reject) => {
            const cb = (err, reply) => {
                if(err) {
                    console.error('redis set error', err)
                    reject(err)
                } else {
                    console.log('设置成功')
                    resolve(true)
                }
            }
            if(expireTime !== undefined) {
                this.redisClient.set(key, value, 'EX', `${expireTime/1000}`, cb)
            } else {
                this.redisClient.set(key, value, cb)
            }
        })
    }
    del({
        key
    }) {
        return new Promise((resolve, reject) => {
            const cb = (err, reply) => {
                if(err) {
                    console.error('redis del error', err)
                    reject(err)
                } else {
                    console.log('删除redis 对应key 成功')
                    resolve(true)
                }
            }
            this.redisClient.del(key, cb)
        })
    }
}