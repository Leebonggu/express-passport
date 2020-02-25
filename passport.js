const alert = require('alert-node');
const bcrypt = require('bcrypt');
const fs = require('fs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

module.exports = function() {
  passport.serializeUser((user, done) => { // Strategy 성공 시 호출됨
    done(null, user); // 여기의 user가 deserializeUser의 첫 번째 매개변수로 이동
  });
  passport.deserializeUser((user, done) => {  // 매개변수 user는 serializeUser의 done의 인자 user를 받은 것
    done(null, user); // 여기의 user가 req.user가 됨
  });

  passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    session: true, // 세션에 저장여부
    passReqToCallback: false,
  }, (username, password, done) => {
    fs.readFile('userList.json', 'utf8', (err, data) => {
      if (err) {
        console.log(err);
        return;
      }
      const users = JSON.parse(data);
      const { user } = users;
      const checkUsers = user.filter((eachData) => {
        return eachData.username === username;
      });
      if (checkUsers.length > 0 ) {
        bcrypt.compare(password, checkUsers[0].password)
        .then((result) => {
          if (!result) {
            return done(null, false, { message: '비밀번호 틀려버렸다'});
          }
          return done(null, {
            username: checkUsers[0].username
          });
        });
       } else {
        alert('존재하는 아이디가 없습니다')
        return done(null, false, { message: '존재하지 않는 아이디!' });
      }
    });
  }));
;}