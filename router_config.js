const user = require('./routes/user')
const validation = require('./validation/user_validation')

module.exports = (app)=>{
    app.post('/user_login',validation.validateLogin,user.user_login)
    app.get('/user_nearby',validation.validatenearby,user.session_middleware,user.user_nearby)
    app.post('/import_user',user.import_user)
    app.post('/add_user',validation.validateAddUser,user.add_user)
}