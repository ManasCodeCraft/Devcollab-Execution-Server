const express = require('express');
const { reconnectServer } = require('../controllers/mainServerRequest');
const { validateMainServer } = require('../middlewares/validateMainServer');

const mainServerRouter = express.Router();

mainServerRouter.route('/reconnect').get(validateMainServer, reconnectServer);


module.exports = mainServerRouter;