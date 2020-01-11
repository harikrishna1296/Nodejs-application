const md5 = require('md5')

//User Login
exports.user_login = async function(req,res){
    let session = req.session;
    let res_send = {}
    let data = req.body
    let password = md5(data.password)
    let user_name = data.user_name.toLowerCase()
    let list = await req.app.locals.db.collection('user').find({username_url:user_name,password:password}).toArray()
    //Setting session for 1 min 
    session.cookie.expires = new Date(Date.now() + 60000)
    session[user_name] = list[0]
    res_send.user = list;
    res_send.status = 200;
    res.json(res_send)
}

//Session Check Middleware
exports.session_middleware = async function(req,res,next){
    let data = req.query;
    let user_name = data.user_name.toLowerCase()
    //Checking the session
    if(req.session[user_name]){
        next();
    }else{
        //If session expired User has to Login
        res.json({message:"Kindly login to access this Api",status:199})
    }
}

//Getting nearby user based on distance
exports.user_nearby = async function(req,res){
    let res_send = {}
    let data = req.query;
    data.user_name = data.user_name.toLowerCase()
    let coordinates = []
    if(data.type=='near_me'){
        let details = await req.app.locals.db.collection('user').find({username_url : data.user_name}).toArray()
        coordinates =  details[0].location.coordinates
    }else{
        coordinates = [ parseFloat(data.lat) ,parseFloat(data.lon) ]
    }
    let aggregate = [
        {
            $geoNear : {
                near : {type : 'Point' , coordinates: coordinates },
                key: "location",
                query :{},
                distanceField: "distance"
            }
        }
    ]
    let list = await req.app.locals.db.collection('user').aggregate(aggregate).toArray()
    res_send.list = list;
    res_send.status = 200;
    res.json(res_send)
}