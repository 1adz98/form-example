const express = require('express')
const mysql = require('mysql')
const router = express.Router()
const bcrypt = require('bcrypt')
const connector = require('../controller/db_config')
const Joi = require('joi')


const con = mysql.createConnection(connector);


// Connect to the MySQL server
con.connect((err)=>{
    if(err) {
        console.log(err);
    }else{
        console.log('connected !!');
    }
})

const passwordSchema = Joi.string().min(8).pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required();

router.post('/', (req, res) => {
    const { username, email ,password} = req.body;

  // Validate the password
  const { error } = passwordSchema.validate(password);
  if (error) {
    res.status(400).json({ error: 'Invalid password.' });
    return;
  }

    // Function to check if a user with the given username or email already exists
    const checkUserExists = (username, email, callback) => {
      const query = 'SELECT COUNT(*) AS count FROM users WHERE username = ? OR email = ?';
      con.query(query, [username, email], (error, results) => {
        if (error) {
          callback(error);
          return;
        }
        const count = results[0].count;
        const exists = count > 0;
        callback(null, exists);
      });
    };
    // Check if the user already exists
    checkUserExists(username, email, (error, exists) => {
      if (error) {
        console.error('Error checking username and email: ' + error);
        res.status(500).json({ error: 'An error occurred while checking the username and email.' });
        return;
      }
      if (exists) {
        // If the user already exists, send a conflict response
        res.status(409).json({ error: 'Username or email already exists.' });
      } else {
//  hash password
bcrypt.hash(password, 10, (hashError, hashedPassword) => {
    if (hashError) {
      console.error('Error hashing password: ' + hashError);
      res.status(500).json({ error: 'An error occurred while hashing the password.' });
      return;
    }

// Insert the new user into the database
        const insertQuery = 'INSERT INTO users (username, email , password) VALUES (?, ? , ?)';
        con.query(insertQuery, [username, email , hashedPassword], (insertError) => {
          if (insertError) {
            console.error('Error inserting new user: ' + insertError);
            res.status(500).json({ error: 'An error occurred while inserting the new user.' });
            return;
          }
          res.status(201).json({ message: 'New user inserted successfully.' });
        });
      }
)}
    });
  });

  module.exports = router