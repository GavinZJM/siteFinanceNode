const dbApis = {
    // user表
    registerUser({
        userName,
        account,
        pwd,
        avatar = null
    }) {
        return new Promise((resolve) => {
            global.$Mysql.query(`insert into user(userName, account, pwd, avatar) values('${userName}', '${account}', '${pwd}', ${avatar})`, (error, results) => {
                if(error) {
                    console.error('registerUser插入失败', error)
                    return resolve(global.$RM.error({
                        data: error
                    }))
                }
                resolve(global.$RM.success({
                    data: results
                }))
            })
        })
    },
    addUser({ account, pwd, userName }) {
        return new Promise(resolve => {
            const sql = `insert into user(account, pwd, userName) values ('${account}', '${pwd}', '${userName}')`
            global.$Mysql.query(sql, (error, results) => {
                if(error) {
                    console.error('add user fail', error)
                    return resolve(global.$RM.error({
                        data: error
                    }))
                } else {
                    return resolve(global.$RM.success({
                        data: results
                    }))
                }
            })
        })
    },
    queryUser({
        account,
        pwd
    }) {
        return new Promise((resolve) => {
            console.log('queryUser sql', `select * from user where account='${account}' and pwd='${pwd}'`)
            global.$Mysql.query(`select * from user where account='${account}' and pwd='${pwd}'`, (error, results) => {
                if(error) {
                    console.error('查询用户失败', error)
                    return resolve(global.$RM.error({
                        data: error
                    }))
                } else {
                    if(results.length === 0) {
                        return resolve(global.$RM.error({
                            data: 'not fount user'
                        }))
                    } else {
                        return resolve(global.$RM.success({
                            data: results[0]
                        }))
                    }

                }
            })
        })
    },
    setUserAvatar({
        userId,
        avatarUrl
    }) {
        return new Promise((resolve) => {
            global.$Mysql.query(`update user set avatar = "${avatarUrl}" where userId = '${userId}';`, (error, results) => {
                if(error) {
                    console.error('设置头像失败', error)
                    return resolve(global.$RM.error({
                        data: error
                    }))
                } else {
                    return resolve(global.$RM.success({
                        data: {
                            ...results,
                            avatarUrl
                        }
                    }))
                }
            })
        })
    },
    // 财务表
    insertSiteFinance(data) {
        return new Promise((resolve) => {
          let sqlStr = 'insert into siteFinance(position, time,type,payer,receiver,content,money,transferType,remark) values'
            data.forEach((item, index) => {
                const { position, time, type, payer, receiver, content, money, transferType, remark } = item
                sqlStr  += (`('${position}', '${global.$Utils.formatExcelDateToDate(time)}', '${type || ''}', '${payer || ''}', '${receiver || ''}','${content || ''}', '${money || ''}','${transferType || ''}','${remark || ''}')` +  (index !== data.length -1 ? ',' : ''))
            })
            global.$Mysql.query(sqlStr, (error, results) => {
                if(error) {
                    console.error('excel插入失败', error)
                    return resolve(global.$RM.error({
                        data: error
                    }))
                }
                resolve(global.$RM.success({
                    data: results
                }))
            })
        }) 
    },
    // 字典表
    insertDirector(data) {
        return new Promise((resolve) => {
            let sqlStr = 'insert into director(key, value, type) values'
              data.forEach((item, index) => {
                  const { key, value, type } = item
                  sqlStr  += (`('${key}, ${value}', '${type}'` +  (index !== data.length -1 ? ',' : ''))
              })
              global.$Mysql.query(sqlStr, (error, results) => {
                  if(error) {
                      console.error('excel插入失败', error)
                      return resolve(global.$RM.error({
                          data: error
                      }))
                  }
                  resolve(global.$RM.success({
                      data: results
                  }))
              })
          }) 
    },
    searchDirectorByPage(data) {
        return new Promise(resolve => {
            const { pageSize, pageNo, type } = data
            let sqlStr = 'select * from director'
            let sqlStrCount = 'select count(*) from director'
            if(type) {
                sqlStr = sqlStr + ` where type='${type}'`
                sqlStrCount = sqlStrCount + ` where type='${type}'`
            }
            sqlStr = `${sqlStr} limit ${pageSize} offset ${(pageNo - 1) * pageSize}`
            global.$Mysql.query(sqlStr, (error, results) => {
                if(error) {
                    console.error('字典表分页查询失败')
                    return resolve(global.$RM.error({
                        data: error
                    }))
                }
                global.$Mysql.query(sqlStrCount, (error, resultCountObj) => {
                    if(error) {
                        console.error('字典表总数查询失败')
                        return resolve(global.$RM.error({
                            data: error
                        }))
                    }
                    console.log('resultCountObj', resultCountObj)
                    resolve(global.$RM.success({
                        data: {
                            count: resultCountObj[0][`count(*)`],
                            list: results
                        }
                    }))
                })
            })
        })
    },
    searchSiteFinanceByPage(data) {
        return new Promise(resolve => {
            const paramStrs = [
                'position',
                'startTime',
                'endTime',
                'type',
                'payer',
                'receiver',
                'content',
                'money',
                'transferType',
                'remark'
            ]
            let sqlStr = 'select * from siteFinance'
            let sqlStrCount = 'select count(*) from siteFinance'
            let hasWhereStr = false
            paramStrs.forEach(paramKey => {
                if(paramKey && data[paramKey]) {
                    if(paramKey === 'startTime' || paramKey === 'endTime') {
                        if(hasWhereStr) {
                            sqlStr = sqlStr + `and time ${paramKey === 'startTime' ? '>=': '<='} '${data[paramKey]}'`
                            sqlStrCount = sqlStrCount + `and time ${paramKey === 'startTime' ? '>=': '<='} '${data[paramKey]}'`
                        } else {
                            sqlStr = sqlStr + ` where time ${paramKey === 'startTime' ? '>=': '<='} '${data[paramKey]}'`
                            sqlStrCount = sqlStrCount + ` where time ${paramKey === 'startTime' ? '>=': '<='} '${data[paramKey]}'`
                        }
                    } else {
                        if(hasWhereStr) {
                            sqlStr = sqlStr + `and ${paramKey} like '%${data[paramKey]}%'`
                            sqlStrCount = sqlStrCount + `and ${paramKey} like '%${data[paramKey]}%'`
                        } else {
                            sqlStr = sqlStr + ` where ${paramKey} like '%${data[paramKey]}%'`
                            sqlStrCount = sqlStrCount + ` where ${paramKey} like '%${data[paramKey]}%'`
                        }
                    }
                    hasWhereStr = true
                }
            })
            if('pageNo' in data && 'pageSize' in data) {
                sqlStr = `${sqlStr} limit ${data.pageSize} offset ${(data.pageNo - 1) * data.pageSize}`
            }
            console.log('searchSiteFinanceByPageSql', sqlStr)
            global.$Mysql.query(sqlStr, (error, results) => {
                if(error) {
                    console.error('查询失败')
                    return resolve(global.$RM.error({
                        data: error
                    }))
                }
                global.$Mysql.query(sqlStrCount, (error, resultCountObj) => {
                    if(error) {
                        console.error('查询失败')
                        return resolve(global.$RM.error({
                            data: error
                        }))
                    }
                    resolve(global.$RM.success({
                        data: {
                            count: resultCountObj[0][`count(*)`],
                            list: results
                        }
                    }))
                })
            })
        })
    },
    searchSiteFinanceByCount(data) {
        return new Promise(resolve => {
            const paramStrs = [
                'position',
                'startTime',
                'endTime',
                'type',
                'payer',
                'receiver',
                'content',
                'money',
                'transferType',
                'remark'
            ]
            let sqlStr = 'select sum(money) from siteFinance'
            let hasWhereStr = false
            paramStrs.forEach(paramKey => {
                if(paramKey && data && data[paramKey]) {
                    if(paramKey === 'startTime' || paramKey === 'endTime') {
                        if(hasWhereStr) {
                            sqlStr = sqlStr + `and time ${paramKey === 'startTime' ? '>=': '<='} '${data[paramKey]}'`
                        } else {
                            sqlStr = sqlStr + ` where time ${paramKey === 'startTime' ? '>=': '<='} '${data[paramKey]}'`
                        }
                    } else {
                        if(hasWhereStr) {
                            sqlStr = sqlStr + `and ${paramKey} like '%${data[paramKey]}%'`
                        } else {
                            sqlStr = sqlStr + ` where ${paramKey} like '%${data[paramKey]}%'`
                        }
                    }
                    hasWhereStr = true
                }
            })
            sqlStr = `${sqlStr}`
            global.$Mysql.query(sqlStr, (error, results) => {
                if(error) {
                    console.error('查询失败')
                    return resolve(global.$RM.error({
                        data: error
                    }))
                }
                    resolve(global.$RM.success({
                        data: {
                            total: results[0][`sum(money)`]
                        }
                    }))
            })
        })
    },
    downloadTemplate() {}
}
module.exports = dbApis