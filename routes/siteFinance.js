const router = require("koa-router")();
const fs = require("fs");
const XLSX = require("xlsx");
router.prefix("/siteFinance");
const iconv = require('iconv-lite');
const customColumns = {
  position: '归属地',
  time: "时间",
  type: "类型",
  payer: "付款方",
  receiver: "收款方",
  content: "内容",
  money: "金额",
  transferType: "转账方式",
  remark: "备注",
};

router.post("/uploadDataByExcel", async function (ctx, next) {
  const {
    excelFile
  } = ctx.request.files;
  const readStream = fs.createReadStream(excelFile.filepath);
  const uploadPath = "./public/file/siteFinance/" + excelFile.originalFilename;
  const writeStream = fs.createWriteStream(uploadPath);
  readStream.pipe(writeStream);
  const excelJsonObj = {};
  // 读取工作簿
  const workbook = XLSX.readFile(excelFile.filepath);
  // 获取工作表名字列表
  const sheet_name_list = workbook.SheetNames;
  sheet_name_list.forEach((sheetNameItem) => {
    excelJsonObj[sheetNameItem] = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheetNameItem]
    );
  });
  // 校验key值
  const checkExcelResult = global.$Utils.checkExcelData({
    excelData: excelJsonObj,
    customColumns,
  });

  if (checkExcelResult) {
    const resultData = global.$Utils.transferSiteFinanceExcelData({
      excelData: excelJsonObj,
      customColumns,
    });
    // 这里转换下时间为毫秒单位
    try {
      resultData.forEach(resultItem => {
        if ('time' in resultItem) {
          resultItem.time = new Date(resultItem.time).getTime()
        }
      })
      // 校验插入数据的格式

      const res = await global.$DbApis.insertSiteFinance(resultData);
      ctx.body = res;
    } catch (e) {
      ctx.body = global.$RM.error({
        data: "excel格式不正确",
      });
      console.error('时间转换报错', e)
    }
  } else {
    ctx.body = global.$RM.error({
      data: "excel格式不正确",
    });
  }
});
router.post("/searchByPage", async function (ctx, next) {

  const res = await global.$DbApis.searchSiteFinanceByPage(ctx.request.body)
  ctx.body = res

})

router.post("/searchByCount", async function(ctx, next) {
  const res = await global.$DbApis.searchSiteFinanceByCount(ctx.request.body)
  ctx.body = res
})

router.post('/getExcelTemplete', async function (ctx, next) {
    let fileReader = fs.createReadStream('./public/file/siteFinance/financeTemplate.xlsx') //fs读取文件流
    ctx.body = fileReader
})

router.post('/getLineChartData', async function (ctx, next) {
  const res = await global.$DbApis.getSiteFinanceLineChart(ctx.request.body)
})

module.exports = router;