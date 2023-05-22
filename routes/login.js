const express = require('express')
const mysql = require('mysql')
const router = express.Router()
const bcrypt = require('bcrypt')

const connector = require('../controller/db_config')

const con = mysql.createConnection(connector);


// Connect to the MySQL server
con.connect((err)=>{
    if(err) {
        console.log(err);
    }else{
        console.log('connected !!');
    }
})

router.post('/', (req, res) => {
    const { username, password } = req.body;
  
    const query = 'SELECT * FROM users WHERE username = ?';
    con.query(query, [username], (error, results) => {
      if (error) {
        console.error('Error retrieving user: ' + error);
        res.status(500).json({ error: 'An error occurred while retrieving the user.' });
        return;
      }
  
      if (results.length === 0) {
        res.status(404).json({ error: 'User not found.' });
      } else {
        const user = results[0];
        bcrypt.compare(password, user.password, (compareError, isMatch) => {
          if (compareError) {
            console.error('Error comparing passwords: ' + compareError);
            res.status(500).json({ error: 'An error occurred while comparing passwords.' });
            return;
          }
  
          if (isMatch) {
            res.status(200).json({ message: 'Login successful.' });
          } else {
            res.status(401).json({ error: 'Incorrect password.' });
          }
        });
      }
    });
  });

  module.exports = router