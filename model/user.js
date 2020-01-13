const _ = require('lodash')
const md5 = require('md5')
var forEach = require('async-foreach').forEach;



exports.user_data = function (connection, data, file_index) {
    return new Promise((resolve, reject) => {
        let errors = []
        forEach(data, async function (e, index) {
            let values = _.values(e)
            if (_.every(['username', 'latitude', 'longitude', 'password', 'place'], _.partial(_.has, e)) && !(values.includes(''))) {
                e["location"] = { type: "Point", coordinates: [parseFloat(e.latitude), parseFloat(e.longitude)] };
                e["username_url"] = (e.username).toLowerCase();
                e['password'] = md5(e.password)
                delete e.latitude
                delete e.longitude
                let user = await connection.collection('user').updateOne({ username_url: e.username_url }, { $set: e }, { upsert: true }).catch((e) => { console.log(e); reject({ status: 199 }) })
            } else {
                if (e['username'] == undefined || e['username'] == '') {
                    errors.push(`Invalid username in row ${index + 1}(File no: ${file_index + 1})`)
                }
                if (e['password'] == undefined || e['password'] == '') {
                    errors.push(`Invalid password in row ${index}(File no: ${file_index})`)
                }
                if (e['latitude'] == undefined || e['latitude'] == '') {
                    errors.push(`Invalid latitude in row ${index}(File no: ${file_index})`)
                }
                if (e['longitude'] == undefined || e['longitude'] == '') {
                    errors.push(`Invalid longitude in row ${index}(File no: ${file_index})`)
                }
                if (e['place'] == undefined || e['place'] == '') {
                    errors.push(`Invalid place in row ${index}(File no: ${file_index})`)
                }
            }
        },()=>{
            let res = { errors: errors }
            res["status"] = 200;
            resolve(res);
        })
    })
}