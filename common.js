const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const dotenv = require('dotenv');
module.exports = {
  express,
  router,
  prisma,
  faker,
  bcrypt,
  jwt,
  axios,
  dotenv,
};
