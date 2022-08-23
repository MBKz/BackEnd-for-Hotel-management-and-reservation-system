module.exports = function asyncMiddleware ( handler ){
    return async (req,res,next) => {
        try {
            handler;
        } catch(ex) {
            next(ex);
            }
    }
}