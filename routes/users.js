const router = require('koa-router')()
const fs = require('fs')
const path = require('path')
router.prefix('/user')

router.post('/register', async function (ctx, next) {
  const { account, pwd, userName } = ctx.request.body
  const addUserRes = await global.$DbApis.addUser({ account, pwd, userName })
  ctx.body = addUserRes
})

router.post('/login', async function (ctx, next) {
  const { account, pwd } = ctx.request.body
  const queryUserRes = await global.$DbApis.queryUser({ account, pwd })
  const { code, data } = queryUserRes
  if(code === 0) {
    // 判断是否是重复登录 这里有顶号操作
    let token = global.$Utils.createToken({ payload: {
      ...data
    }})
      // 如果重复登陆 删掉redis对应缓存
        const { userId } = data
        const oldToken = await global.$RD.get({
          key: userId
        })
        if(oldToken) {
          await global.$RD.del({
            key: userId
          })
          await global.$RD.del({
            key: oldToken
          })
        }
      const expireTime = 1000 * 60 * 60 * 24 * 7
      await global.$RD.set({
        key: token,
        value: JSON.stringify(data),
        expireTime
      })
      await global.$RD.set({
        key: data.userId,
        value: token,
        expireTime
      })
    ctx.body = {
      ...queryUserRes,
      data: {
        ...data,
        token
      }
    }
  } else {
    ctx.body = queryUserRes
  }
})

router.post('/setAvatar', async function (ctx, next) {
  const { avatarFile } = ctx.request.files
  const readStream = fs.createReadStream(avatarFile.filepath)
  const uploadPath = './public/images/avatar/' + avatarFile.originalFilename
  const writeStream = fs.createWriteStream(uploadPath)
  readStream.pipe(writeStream)
  const res = await global.$DbApis.setUserAvatar({
    userId: 1,
    avatarUrl: path.join(global.$ENV.NODE_UPLOAD_URL, uploadPath)
  })
  ctx.body = res
})

module.exports = router
