const Koa = require("koa");
const app = new Koa();
const views = require("koa-views");
const json = require("koa-json");
const onerror = require("koa-onerror");
const { koaBody } = require("koa-body");
const logger = require("koa-logger");

const siteFinanceRouter = require("./routes/siteFinance");
const directorRouter = require("./routes/director");
const users = require("./routes/users");

// 导入环境变量
const globalEnv = require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
}).parsed;
global.$ENV = globalEnv;

// error handler
onerror(app);

// 导入 状态码 文件
const httpStatusConf = require('./utils/statusCode/index')
global.$HttpStatusConf = httpStatusConf
// 导入utils
const Utils = require('./utils/index')
global.$Utils = Utils
// mounted dbApi
const dbApis = require("./db/api");
global.$DbApis = dbApis;
const ResponseModuleClass = require("./utils/responseModule");
global.$RM = new ResponseModuleClass();
// install mysql
const MysqlDBClass = require("./db/index");
// install redis
const RedisClass = require("./redis/redisClass");
const RedisClassImpl = new RedisClass();
RedisClassImpl.open().then(() => {
  global.$RD = RedisClassImpl
  const MysqlDBClassImpl = new MysqlDBClass({});
  MysqlDBClassImpl.open().then((res) => {
    if (res) {
      // 挂载数据库
      global.$Mysql = MysqlDBClassImpl.connectionImpl;
      // middlewares
      app.use(
        koaBody({
          enableTypes: ["json", "form", "text"],
          multipart: true,
          formidable: {
            maxFileSize: 200 * 1024 * 1024,
          },
        })
      );
      app.use(json());
      app.use(logger());
      app.use(require("koa-static")(__dirname + "/public"));

      app.use(
        views(__dirname + "/views", {
          extension: "ejs",
        })
      );

      // logger
      app.use(async (ctx, next) => {
        const start = new Date();
        await next();
        const ms = new Date() - start;
        console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
      });
      // 设置token检验 中间件逻辑
      app.use(async (ctx, next) => {
        const token = ctx.headers.token
        const result = await global.$Utils.checkToken({
          token,
          ctx
        })
        if(result) {
          await next()
        } else {
          ctx.status = global.$HttpStatusConf.noRight
          ctx.body = global.$RM.error({
            data: 'token is lost'
          })
        }
      })
      // routes
      app.use(siteFinanceRouter.routes(), siteFinanceRouter.allowedMethods());
      app.use(users.routes(), users.allowedMethods());
      app.use(directorRouter.routes(), directorRouter.allowedMethods());
    }
  });
});

// error-handling
app.on("error", (err, ctx) => {
  console.error("server error", err, ctx);
});

module.exports = app;
