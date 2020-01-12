const _ = require('lodash')
const md5 = require('md5')


exports.user_data = function(connection,data){
    data.map(async (e)=>{
        if(_.every(['username','latitude','longitude','password'],_.partial(_.has,e))){
            e["location"] = { type :"Point" , coordinates : [parseFloat(e.latitude),parseFloat(e.longitude)]};
            e["username_url"] = (e.username).toLowerCase();
            e['password'] = md5(e.password)
            delete e.latitude
            delete e.longitude
            let user = await connection.collection('user').updateOne({username_url : e.username_url},{$set:e},{upsert : true}).catch((e)=>{console.log(e);return 199})
        }
    })
    return 200; 
}