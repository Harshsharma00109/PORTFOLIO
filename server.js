require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const path = require('path');
const cors = require('cors');

const contactRoute = require('./routes/contact');
const adminRoute = require('./routes/admin');

const app = express();
const PORT = 5000;

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB error:', err);
    process.exit(1);
  });

/* ✅🔥 FIXED CORS (MAIN FIX) */
app.use(cors()); 
// OR if you want strict:
// app.use(cors({ origin: "http://localhost:5000" }));

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret123',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  }
}));

// ✅ API Routes
app.use('/api/contact', contactRoute);
app.use('/admin', adminRoute);

// ✅ Static Files
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Home Route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});