const md5 = require('md5')
const multer = require('multer');
const path = require('path')
const fs = require('fs')
const csv = require('csv-parser');
const model = require('../model/user')


const storage = multer.diskStorage({
    fileFilter : function(req,file,callback){
        file.mimetype === 'text/csv' ? callback(null, true) : callback(null, false)
    },
    destination: function (req, file, callback) {
        file.mimetype === 'text/csv' ? callback(null, './upload') : callback(null, false)
    },
    filename: function (req, file, callback) {
      callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });


const upload = multer({ storage : storage }).array('file',5);

//User Login
exports.user_login = async function(req,res){
    let session = req.session;
    let res_send = {}
    let data = req.body
    let password = md5(data.password)
    let user_name = data.user_name.toLowerCase()
    let list = await req.app.locals.db.collection('user').find({username_url:user_name,password:password}).toArray()
    //Setting session for 1 min 
    if(list.length>0){
        session.cookie.expires = new Date(Date.now() + 60000)
        session[user_name] = list[0]
        res_send.message = "LoggedIn successfully";
        res_send.status = 200;
    }else{
        res_send.message = "Incorrect username or password"
        res_send.status = 199;
    }
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
    let a = ['near_me','coordinates']
    if(a.indexOf(data.type)==-1){
        res.json({message:"Invalid type",status:199})
        return
    }
    let coordinates = []
    if(data.type=='near_me'){
        //Geo near based on User Coordinated
        let details = await req.app.locals.db.collection('user').find({username_url : data.user_name}).toArray()
        coordinates =  details[0].location.coordinates
    }else{
        //Based on customised coordinates
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

//Import csv
exports.import_user = function(req,res){
    upload(req,res,function(err) {
        if(err){
            console.log(err)
        }
        else{
            let errors = [];
            req.files.forEach(async(e,index) => {
                let total_list = [];
                fs.createReadStream(e.path)
                .pipe(csv())
                .on('data', function(data){
                    total_list.push(data)
                })
                .on('end',function(){
                    fs.unlink(e.path,async function (err) {
                        if (err) throw err;
                        let result = await model.user_data(req.app.locals.db,total_list,index)
                        if(result.status==199){
                            res.json({'message':"Error in importing user",status:199})
                        }else if(result.status==200){
                            let err = result.errors
                            errors = [...errors,...err]
                        }   
                        if(index==(req.files.length-1)){
                            res.json({'message':"User Imported successfully",status:200,errors : errors})
                        }
                    })
                });  
            });
        }
    });
}