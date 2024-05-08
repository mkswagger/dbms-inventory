import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// Open SQLite database
open({
  filename: "./inventory.db",
  driver: sqlite3.Database,
}).then(async (db) => {
  // Drop the shop_id column
  await db.exec(`
    PRAGMA foreign_keys=off;
    BEGIN TRANSACTION;
    
    CREATE TABLE Shop_backup(
        id INTEGER PRIMARY KEY,
        name TEXT,
        type TEXT,
        location TEXT,
        capacity INTEGER
    );

    INSERT INTO Shop_backup SELECT id, name, type, location, capacity FROM Shop;

    DROP TABLE Shop;

    ALTER TABLE Shop_backup RENAME TO Shop;

    COMMIT;

    PRAGMA foreign_keys=on;
  `);

  app.get("/", (req, res) => {
    res.json("backend hai idhr");
  });

  // Get all shops
  app.get("/shops", async (req, res) => {
    try {
      const shops = await db.all("SELECT * FROM Shop");
      res.json(shops);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "An error occurred" });
    }
  });

  // Add a new shop
  app.post("/shops", async (req, res) => {
    const { name, type, location, capacity } = req.body;
    try {
      const result = await db.run(
        "INSERT INTO Shop (name, type, location, capacity) VALUES (?, ?, ?, ?)",
        [name, type, location, capacity]
      );
      res.json({ message: "Shop added successfully", shop_id: result.lastID });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "An error occurred" });
    }
  });

  app.listen(8800, () => {
    console.log("Server running on port 8800");
  });
});
