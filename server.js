const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
mongoose = require('mongoose');
const Schema = mongoose.Schema;
const MONGO_URI = process.env['MONGO_URI'];
mongoose.connect(MONGO_URI,{useNewUrlParser:true, useUnifiedTopology:true});
const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

const UserSchema = new Schema({
  username: {type:String, required:true},
  log: [{
    description: {type:String,required:false},
    duration: {type:Number,required:false},
    date: {type:String, required:false}
  }]

}
);

const User = mongoose.model('User', UserSchema);


app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.post('/api/users',(req,res)=>{
  // console.log(req.body);
  let username_ = req.body.username;
  
    let users = new User({
      username:username_
    })
    users.save((err,data)=>{
      if(err) return console.error(err);
      let data_ = {
        'username': data.username,
        '_id':data._id
      }

      res.json(data_);
    
    })

})

app.get('/api/users',(req,res)=>{
  let users= User.find({},{log:0},(err,data)=>{
    if(err) return console.error(err);

    console.log(data);
    res.json(data);
  });
  console.log(users.tree);


});



app.post('/api/users/:_id/exercises',(req, res)=>{
  // console.log(req.params._id)
  let id_ = req.params._id || req.body._id;
  let description = req.body.description;
  let duration = req.body.duration;
  let date = req.body.date;
  // console.log(req.body);
  const defaultDate= ()=>{
     return new Date().toDateString()
  };
  const dateString = ()=>{
    return new Date(date).toDateString();
  };
  let date_ = (date ==undefined) ?defaultDate(): dateString(); 
  // console.log(date);
  // console.log(date_)
  let updateData = {
  "description":description,
  "duration":Number(duration),
  "date": date_

  };
  console.log(updateData);

  // console.log('this is a test',id_);
  User.findByIdAndUpdate({"_id":id_},{$push:{log: updateData}},{new:true},(error,updatedUsers)=>{
    // console.log(2);
    if(error) return console.error(error);
    let returnObj= {
      "username": updatedUsers.username,
      "description": updateData.description,
      "duration": updateData.duration,
      "date":updateData.date,
      "_id": updatedUsers._id
    };
    // console.log(returnObj);
    res.json(returnObj);
  });
});

app.get('/api/users/:id/logs', (req,res)=>{
  const id = req.params.id;
  const fromDate = req.query.from;
  const toDate = req.query.to;
  const limit= req.query.limit;
  // console.log(fromDate,toDate,limit)

  User.findById(
    {'_id':id},(err, userLog)=>{
      if(err) return console.error(err);
    let logData = userLog.log;

    if(fromDate){
      console.log('from');
      const fromDate_ = new Date(fromDate)
      logData = logData.filter(log => new Date(log.date) > fromDate_);
    }
    if(toDate){
      console.log('to');
      const toDate_ = new Date(toDate)
      logData= logData.filter(log => new Date(log.date)< toDate_);

    }

    if(limit){
      console.log('limit');
      logData = logData.slice(0,limit);
    }



      let returnObj = {
        "username": userLog.username,
        "count": userLog.log.length,
        "_id":userLog._id,
        'log':logData
      };
      // console.log(returnObj);
      res.json(returnObj);
    }
  )
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
