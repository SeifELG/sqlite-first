const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(express.json());

const port = 3000;

// Connect to SQLite database
const db = new sqlite3.Database('database.db'); // Use ':memory:' for an in-memory database, or 'database.db' for file-based

// Create a table
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT)");

    // Insert some data
    db.run("INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com')");
    db.run("INSERT INTO users (name, email) VALUES ('Jane Doe', 'jane@example.com')");
});

// Route to get all users
app.get('/users', (req, res) => {
    db.all("SELECT * FROM users", [], (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        res.json(rows);
    });
});

// Route to add a new user
app.post('/users', (req, res) => {
    const { name, email } = req.body;
  
    // Basic validation
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }
  
    // SQL query to insert a new user
    const query = "INSERT INTO users (name, email) VALUES (?, ?)";
    
    db.run(query, [name, email], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Return the ID of the newly inserted user
    //   res.status(201).json({
    //     message: "User added successfully",
    //     userId: this.lastID
    //   });

      db.get("SELECT * FROM users WHERE id = ?", [this.lastID], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        // Echo back the newly created user object
        res.status(201).json(row);
      });
    });
  });

// Route to search for users by first name
app.get('/users/search', (req, res) => {
    const name = req.query.name;
    console.log("🚀 ~ app.get ~ name:", name)

    // SQL query to select users with the given first name
    db.all("SELECT * FROM users WHERE LOWER(name) LIKE LOWER(?)", ['%' + name + '%'], (err, rows) => {
        if (err) {
            res.status(500).send(err.message);
            return
        }
        // If no users are found, return a 404 status
        if (rows.length === 0) {
            res.status(404).send('No users found with that first name');
            return
        }
        res.json(rows);
    });
});

// Route to get a user by id
app.get('/users/:id', (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
        if (err) {
            res.status(500).send(err.message);
            return;
        }
        if (row === undefined) {
            res.status(404).json({ error: "no such id" });
            return;
        }
        res.json(row);
    });
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
