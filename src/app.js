const express = require('express');
const path = require('path');
const indexRouter = require('./routes/index');
const scheduler = require('./services/scheduler');

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize scheduler
scheduler.initializeScheduler();

// Routes
app.use('/', indexRouter);

module.exports = app; 