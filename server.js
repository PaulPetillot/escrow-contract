const express = require('express');
const Sequelize = require('sequelize');
const cors = require('cors');

const app = express();
app.use(express.json());
const port = 4000;

app.use(cors());

const sequelize = new Sequelize('contractdb', 'user', 'user', {
  host: 'localhost',
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  })

const Contract = sequelize.define('contracts', {
  address: {
    type: Sequelize.STRING
  }
}, {
  timestamps: false
});

app.get('/', async (req, res) => {
  let contracts = await Contract.findAll();
  res.json(contracts);
  console.log(contracts);
});

app.post('/contracts', async (req, res) => {
  let contract = await Contract.create({
    address: req.body.address
  });
  res.json(contract);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
