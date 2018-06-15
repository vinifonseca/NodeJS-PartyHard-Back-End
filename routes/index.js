const express = require('express');
const router = express.Router();
const db = require("../db");
const app = express();    
const passwordHash = require('password-hash');
const jwt = require('jsonwebtoken');

/* GET to get all Party's Service */
router.get('/partys', function (req, res) {
  res = setResHeader(res);

  var Users = db.Mongoose.model('partys', db.Point, 'partys');
  Users.find(
    function (e, docs) {
      res.send(docs)
    });
});

/* GET to get all Party's Service in maxDistance*/
router.get('/partysInRegion', function (req, res) {
    res = setResHeader(res);

    var limit = parseInt(req.query.limit)  || 10;

    var maxDistance = parseInt(req.query.distance) || 10;

    var coords = [];
    coords[0] = parseFloat(req.query.lat) || 0;
    coords[1] = parseFloat(req.query.lng) || 0;
   

    var Users = db.Mongoose.model('partys', db.Point, 'partys');

    Users.find(       
      { 
        point :
       { $near :
          {
            $geometry : {
               type : "Point" ,
               coordinates : [coords[0], coords[1]] },
            $maxDistance : maxDistance,
          }
       }
    }
    ).limit(limit).exec(function(err, locations) {
       if (err) {  
       console.log(err)     
          return  res.status(500).json(err)
       }
       res.status(200).json(locations);
    });
  });


/* POST to Add Party Service */
router.post('/partys', function (req, res) {
  res = setResHeader(res);

  var coords = [];
  coords[0] = parseFloat(req.body.coordinates1);
  coords[1] = parseFloat(req.body.coordinates2);     

  var Users = db.Mongoose.model('partys', db.Point, 'partys');
  var user = new Users({
      point :  {
        type:  req.body.type,
        coordinates: [coords[0], coords[1]]
    },
    name: req.body.name,
    description: req.body.description,
  });
  user.save(function (err) {
    if (err) {
      console.log("Error! " + err.message);
      return err;
    }
    else {
       res.status(200).json(user);
    }
  });
});

/* GET to Auth User*/
router.post('/auth', function(req, res){
  res = setResHeader(res);

  var User = db.Mongoose.model('users', db.User, 'users');
   User.findOne({email: req.body.email})
   .exec()
   .then(function(user) {
      if(passwordHash.verify(req.body.password, user.password)){

        JWTToken = setJWT(user.email, user._id);

       return res.status(200).json({
         token: JWTToken
       });
      }else{
         return res.status(401).json({
            failed: 'Unauthorized Access'
         });
      }
    })
   .catch(error => {
      res.status(500).json({
         error: error
      });
   });;
  });

/* POST to Add new User */
router.post('/accounts', function (req, res) {
  res = setResHeader(res);

  var hashedPassword = passwordHash.generate(req.body.password);

  var Users = db.Mongoose.model('users', db.User, 'users');
  var user = new Users({
      email: req.body.email,
      password: hashedPassword,
  });
  user.save(function (err) {
    if (err) {
      console.log("Error! " + err.message);
      return err;
    }
    else {
       res.status(200).json("User created.");
    }
  });
});

module.exports = router;

function setResHeader(res){
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':'Content-Type',
  })
  return res
}

function setJWT(email, id){
  const JWTToken = jwt.sign({
              email: email,
              _id: id,
              },
              'yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJeyJlbWFpbCPartyHardeI6ImRhZHNkQGFzZGFzZC5jb20iLCJfaWQiOiI1YWRmNTkxMmY',
          {
             expiresIn: '2h'
          });

  return JWTToken
}