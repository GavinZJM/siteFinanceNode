const router = require("koa-router")();
router.prefix("/director");
router.post("/add", async function (ctx, next) {
    const { directorList } = ctx.request.body
    const res = await global.$DbApis.insertDirector(directorList)
    ctx.body = res
});
router.post("/searchByPage", async function (ctx, next) {
    const { pageSize, pageNo, type } = ctx.request.body
    const res = await global.$DbApis.searchDirectorByPage({
        pageSize,
        pageNo,
        type
    })
    ctx.body = res
});

module.exports = router;
