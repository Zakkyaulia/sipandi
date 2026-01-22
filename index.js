// index.js
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes'); // Mengimpor routes

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Menggunakan auth routes
app.use('/api/auth', authRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});