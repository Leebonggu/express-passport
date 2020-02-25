const alert = require('alert-node');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const fs = require('fs');
const passport = require('passport');
const passportConfig = require('./passport');

const middleware = require('./middleware');

const app = express();
const PORT = 4000;
const saltRounds = 10;

app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'asdlkjsa##dlkf',
  resave: true,
  saveUninitialized: true,
}))
app.use(passport.initialize());
app.use(passport.session());
passportConfig();
app.use(middleware);

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/sign-up', (req, res) => {
  res.render('signUp')
});

app.post('/sign-up', (req, res) => {
  const {
    username,
    password,
    passwordConfirm
  } = req.body;
  if (password !== passwordConfirm) {
    alert("비밀번호가 다릅니다.");
    res.redirect('/sign-up');
  } else {
    fs.readFile('userList.json', 'utf8', (err, data) => {
      if (err) {
        console.log(err);
        res.redirect('/sign-up');
      }
      const users = JSON.parse(data);
      const { user } = users;
      const checkUsers = user.filter((eachData) => {
        return eachData.username === username;
      });
      if (checkUsers.length > 0 ) {
        alert('이미 존재하는 아이디!');
        res.redirect('/sign-up');
        return;
      }
      bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
          console.log('hasedError!');
          alert('해쉬과정에 에러가 생겼습니다');
          return res.redirect('/sign-up');
        }
        users.user.push({
          username,
          password: hash,
        });
        const json = JSON.stringify(users);
        fs.writeFile('userList.json', json, 'utf8', () => {
          res.redirect('/sign-in');
        });
      });
    });
  }
});

app.get('/sign-in', (req, res) => {
  res.render('signIn')
});

app.post('/sign-in',
  passport.authenticate('local', {
  failureRedirect: '/sign-in',
}), (req, res) => {
  res.redirect('/');
});

app.get('/sign-out', (req, res) => {
  req.logout();
  res.redirect('/');
})

app.listen(PORT, () => {
  console.log(`SERVER IS RUNNING: ${PORT}`);
});