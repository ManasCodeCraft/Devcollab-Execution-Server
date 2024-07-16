const express = require('express');
const { downloadProject } = require('../controllers/localProjectControllers');
const { validateDownload } = require('../middlewares/localProjectValidator');

const localProjectRouter = express.Router();

localProjectRouter.route('/download/:projectId').get(validateDownload, downloadProject)

module.exports = localProjectRouter;