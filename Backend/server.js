// server.js
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: "*"
}));



// SQLite Database Setup
const db = new sqlite3.Database("./db/database.db", (err) => {
  if (err) console.error(err.message);
  console.log("Connected to SQLite database.");
});

// Create Tables
db.serialize(() => {
  // Table for invoices
  db.run(
    `CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoiceNo TEXT,
      invoiceDate TEXT,
      dueDate TEXT,
      date TEXT,
      recipient TEXT,
      sender TEXT,
      business TEXT,
      bank_details TEXT,
      tax REAL,
      subTotal REAL,
      total REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`
  );

  // Table for invoice items
  db.run(
    `CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER,
      date TEXT,
      description TEXT,
      qty INTEGER,
      rate REAL,
      amount REAL,
      FOREIGN KEY(invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    );`
  );

  // Table for saved senders
  db.run(
    `CREATE TABLE IF NOT EXISTS senders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      address1 TEXT,
      address2 TEXT,
      city TEXT,
      state TEXT,
      country TEXT,
      postcode TEXT,
      email TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`
  );

  // Table for saved businesses
  db.run(
    `CREATE TABLE IF NOT EXISTS businesses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      address1 TEXT,
      address2 TEXT,
      city TEXT,
      state TEXT,
      country TEXT,
      postcode TEXT,
      email TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`
  );

  // Table for bank details
  db.run(
    `CREATE TABLE IF NOT EXISTS bank_details (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account TEXT,
      sort_code TEXT,
      account_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`
  );
});

// Senders endpoints
app.get("/api/senders", (req, res) => {
  db.all("SELECT * FROM senders ORDER BY created_at DESC", [], (err, rows) => {
    if (err) {
      console.error("Error fetching senders:", err.message);
      return res.status(500).send("Failed to fetch senders.");
    }
    res.json(rows);
  });
});

app.post("/api/senders", (req, res) => {
  const {
    name,
    address1,
    address2,
    city,
    state,
    country,
    postcode,
    email,
    phone,
  } = req.body;

  db.run(
    `INSERT INTO senders (name, address1, address2, city, state, country, postcode, email, phone)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, address1, address2, city, state, country, postcode, email, phone],
    function (err) {
      if (err) {
        console.error("Error saving sender:", err.message);
        return res.status(500).send("Failed to save sender.");
      }
      res.json({ id: this.lastID, ...req.body });
    }
  );
});

// Businesses endpoints
app.get("/api/businesses", (req, res) => {
  db.all(
    "SELECT * FROM businesses ORDER BY created_at DESC",
    [],
    (err, rows) => {
      if (err) {
        console.error("Error fetching businesses:", err.message);
        return res.status(500).send("Failed to fetch businesses.");
      }
      res.json(rows);
    }
  );
});

app.post("/api/businesses", (req, res) => {
  const {
    name,
    address1,
    address2,
    city,
    state,
    country,
    postcode,
    email,
    phone,
  } = req.body;

  db.run(
    `INSERT INTO businesses (name, address1, address2, city, state, country, postcode, email, phone)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, address1, address2, city, state, country, postcode, email, phone],
    function (err) {
      if (err) {
        console.error("Error saving business:", err.message);
        return res.status(500).send("Failed to save business.");
      }
      res.json({ id: this.lastID, ...req.body });
    }
  );
});

// Bank details endpoints
app.get("/api/bank-details", (req, res) => {
  db.all(
    "SELECT * FROM bank_details ORDER BY created_at DESC",
    [],
    (err, rows) => {
      if (err) {
        console.error("Error fetching bank details:", err.message);
        return res.status(500).send("Failed to fetch bank details.");
      }
      res.json(rows);
    }
  );
});

app.post("/api/bank-details", (req, res) => {
  const { account, sort_code, account_name } = req.body;

  db.run(
    `INSERT INTO bank_details (account, sort_code, account_name)
     VALUES (?, ?, ?)`,
    [account, sort_code, account_name],
    function (err) {
      if (err) {
        console.error("Error saving bank details:", err.message);
        return res.status(500).send("Failed to save bank details.");
      }
      res.json({ id: this.lastID, ...req.body });
    }
  );
});

// Invoices endpoints
app.get("/api/invoices", async (req, res) => {
  try {
    const invoices = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM invoices ORDER BY invoiceDate DESC", (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });

    const invoicesWithItems = await Promise.all(
      invoices.map(async (invoice) => {
        const items = await new Promise((resolve, reject) => {
          db.all(
            "SELECT * FROM invoice_items WHERE invoice_id = ?",
            [invoice.id],
            (err, rows) => {
              if (err) return reject(err);
              resolve(rows);
            }
          );
        });

        return {
          ...invoice,
          sender: JSON.parse(invoice.sender),
          business: JSON.parse(invoice.business),
          bankDetails: JSON.parse(invoice.bank_details), // Parse bank details
          items,
        };
      })
    );

    res.json(invoicesWithItems);
  } catch (err) {
    console.error("Failed to fetch invoices:", err.message);
    res.status(500).send("Failed to fetch invoices.");
  }
});

app.post("/api/invoices", (req, res) => {
  const { invoiceDetails, sender, business, bankDetails } = req.body;
  const {
    items,
    invoiceNo,
    invoiceDate,
    dueDate,
    recipient,
    date,
    tax,
    subTotal,
    total,
  } = invoiceDetails;

  db.run(
    `INSERT INTO invoices 
      (invoiceNo, invoiceDate, dueDate, date, recipient, sender, business, bank_details, tax, subTotal, total)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      invoiceNo,
      invoiceDate,
      dueDate,
      date,
      recipient,
      JSON.stringify(sender),
      JSON.stringify(business),
      JSON.stringify(bankDetails), // Add bank details
      tax,
      subTotal,
      total,
    ],
    function (err) {
      if (err) {
        console.error("Error saving invoice:", err.message);
        return res.status(500).send("Failed to save invoice.");
      }

      const invoiceId = this.lastID;
      const stmt = db.prepare(
        `INSERT INTO invoice_items (invoice_id, description, qty, rate, amount, date)
         VALUES (?, ?, ?, ?, ?, ?)`
      );

      items.forEach((item) => {
        stmt.run(
          [
            invoiceId,
            item.description,
            item.qty,
            item.rate,
            item.amount,
            item.date,
          ],
          (err) => {
            if (err) console.error("Failed to insert item:", err.message);
          }
        );
      });

      stmt.finalize();
      res.json({
        message: "Invoice and items saved successfully",
        invoiceId,
      });
    }
  );
});

// Add a new endpoint to get a single invoice with all details
app.get("/api/invoices/:id", async (req, res) => {
  try {
    const invoice = await new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM invoices WHERE id = ?",
        [req.params.id],
        (err, row) => {
          if (err) return reject(err);
          if (!row) return reject(new Error("Invoice not found"));
          resolve(row);
        }
      );
    });

    const items = await new Promise((resolve, reject) => {
      db.all(
        "SELECT * FROM invoice_items WHERE invoice_id = ?",
        [invoice.id],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });

    const completeInvoice = {
      ...invoice,
      sender: JSON.parse(invoice.sender),
      business: JSON.parse(invoice.business),
      bankDetails: JSON.parse(invoice.bank_details),
      items,
    };

    res.json(completeInvoice);
  } catch (err) {
    console.error("Failed to fetch invoice:", err.message);
    res
      .status(err.message === "Invoice not found" ? 404 : 500)
      .send(err.message);
  }
});

// Add an endpoint to get invoice history with pagination
app.get("/api/invoices/history", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const [total, invoices] = await Promise.all([
      new Promise((resolve, reject) => {
        db.get("SELECT COUNT(*) as count FROM invoices", (err, row) => {
          if (err) return reject(err);
          resolve(row.count);
        });
      }),
      new Promise((resolve, reject) => {
        db.all(
          `SELECT * FROM invoices 
           ORDER BY created_at DESC 
           LIMIT ? OFFSET ?`,
          [limit, offset],
          (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
          }
        );
      }),
    ]);

    const invoicesWithDetails = await Promise.all(
      invoices.map(async (invoice) => {
        const items = await new Promise((resolve, reject) => {
          db.all(
            "SELECT * FROM invoice_items WHERE invoice_id = ?",
            [invoice.id],
            (err, rows) => {
              if (err) return reject(err);
              resolve(rows);
            }
          );
        });

        return {
          ...invoice,
          sender: JSON.parse(invoice.sender),
          business: JSON.parse(invoice.business),
          bankDetails: JSON.parse(invoice.bank_details),
          items,
        };
      })
    );

    res.json({
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      invoices: invoicesWithDetails,
    });
  } catch (err) {
    console.error("Failed to fetch invoice history:", err.message);
    res.status(500).send("Failed to fetch invoice history.");
  }
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);