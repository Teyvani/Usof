const express = require('express');
const authRoutes = require('./routes/auth.js');

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.listen(PORT, () => {console.log(`Server is running on http://localhost:${PORT}`);});