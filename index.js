const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const handlebars = require('express-handlebars');
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: 'secret' }));
app.engine('.handlebars', handlebars({ defaultLayout: null }));
app.set('view engine', '.handlebars');
app.set('views', __dirname);

const users = [
  {
    email: "test@test.com",
    password: "test",
  },
];

function isLoggedIn(req, res, next) {
  console.log(req.session);
  if (req.session.user) {
    next();
  } else {
    next(new Error('Not logged in'));
  }
};

app.get("/login", function (req, res) {
  res.render("login", { message: req.session.message });
});

app.post("/login", (req, res) => {
  if (!req.body.email || !req.body.password) {
    req.session.message = 'Fill all the fields';
    return res.redirect("/login");
  }
  const user = users.find((user) =>
    user.email === req.body.email && user.password === req.body.password
  );
  if (!user) {
    req.session.message = "Invalid credentials";
    return res.redirect("/login");
  };
  req.session.user = user;
  res.redirect('/home');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.send('Logged out');
});

app.get('/home', isLoggedIn, (req, res) => {
  res.send('Home page, must be logged in to access');
});

app.get('/users/:id/edit', (req, res) => {
  if (req.params.id >= users.length || req.params.id < 0) {
    res.status(404).send('User not found');
  } else {
    res.render('edit');
  }
});

app.post('/users/:id/edit', isLoggedIn, (req, res) => {
  if (req.params.id >= users.length || req.params.id < 0) {
    return res.status(404).send('User not found');
  }
  const user = users[req.params.id];
  user.email = req.body.email;
  console.log('User email changed');
  console.log(user);
  res.redirect('/home');
});

app.use((err, req, res, next) => {
  if (err.message === 'Not logged in') {
    res.redirect('/login');
  }
  next();
});

app.listen(3000);
