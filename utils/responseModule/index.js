const ResponseModuleClass = class ResponseModule {
    error({ data }) {
        return {
            code: -1,
            data
        }
    }
    success({ data }) {
        return {
            code: 0,
            data
        }
    }
}
module.exports = ResponseModuleClass