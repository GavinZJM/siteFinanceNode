const positionEnum = ['南昌']
const typeEnum = []
module.export = function insertSiteFinanceVerify(data) {
    const { position, time, type, payer, receiver, content, money, transferType, remark } = data
    if(!position) return false
    if(position)
}