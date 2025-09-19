const express = require('express');
const mainRouter = require('./routes/mainRouter.js');

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.use('/', mainRouter);

app.listen(PORT, () => {console.log(`Server is running on http://localhost:${PORT}`);});