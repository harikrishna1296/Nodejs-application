const user = require('./routes/user')

module.exports = (app)=>{
    app.post('/user_login',user.user_login)
    app.get('/user_nearby',user.session_middleware,user.user_nearby)
}