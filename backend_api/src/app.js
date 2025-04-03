const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const swaggerSetup = require('./config/swagger');

dotenv.config();

const app = express();

swaggerSetup(app);

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, (err) => {
  if (err) {
    console.error(`Error starting server: ${err.message}`);
  } else {
    console.log(`Server running on port ${PORT}`);
  }
});
