/*Don't forget to:
mysql -u root -p < usof_db.sql | перший запуск
mysql -u admin -P 3306 -padminsecurepass
npm install
npm start*/

const express = require('express');
const session = require('express-session');
const mainRouter = require('./routes/mainRouter.js');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(session({
  secret: '1super_secret9',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 10 * 60 * 1000 } // = 10 minutes
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', mainRouter);

app.listen(PORT, () => {console.log(`Server is running on http://localhost:${PORT}`);});
