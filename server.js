var express = require('express')
var app = express()
var db = require('./database.js')
var cron = require('node-cron')
var bodyParser = require('body-parser')
const { request, response } = require('express')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

let port = 8080
const cors = require('cors')
app.use(cors({
  origin: '*'
}))

app.listen(port, () => {
  console.log("Server running on port %PORT%".replace("%PORT%", port))
})

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateCardNumber = (cardNumber) => {
  const cardNumberRegex = /^\d{12}$/;
  return cardNumberRegex.test(cardNumber);
};

app.post('/api/customers', (req, res) => {
  try {
    const {
      name,
      address,
      email,
      dateOfBirth,
      gender,
      age,
      cardHolderName,
      cardNumber,
      expirytDate,
      cvv,
      timestamp
    } = req.body;

    if (!name || !address || !email || !dateOfBirth || !gender || !age || !cardHolderName || !cardNumber || !expirytDate || !cvv || !timestamp) {
      return res.status(400).json({ "error": "All fields are required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ "error": "Invalid email address" });
    }

    if (!validateCardNumber(cardNumber)) {
      return res.status(400).json({ "error": "Invalid credit card number" });
    }

    const sql = `INSERT INTO customer (
                    name, address, email, dateOfBirth, gender, age, cardHolderName, cardNumber, expirytDate, cvv, timestamp
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [name, address, email, dateOfBirth, gender, parseInt(age), cardHolderName, cardNumber, expirytDate, cvv, timestamp];

    db.run(sql, params, function (err) {
      if (err) {
        return res.status(400).json({ "error": err.message });
      }
      res.status(201).json({
        "message": `Customer ${name} has registered`,
        "customerId": this.lastID
      });
    });
  } catch (error) {
    res.status(500).send(error)
  }
});

app.get('/api/customer', (req, res, next) => {
  try {
    var sql = "SELECT * from customer"
    db.all(sql, (err, rows) => {
      if (err) {
        res.status(400).json({ "error": err.message })
        return
      }
      res.json({
        "message": "success",
        "data": rows
      })
    })
  } catch (error) {
    res.status(500).send(error)
  }
})