const express = require('express');
const { validateMainServer } = require('../middlewares/validateMainServer');
const { onLocal, deleteClientProject, downloadProject, createEmpty } = require('../controllers/localProjectControllers');
const { validateDownload } = require('../middlewares/localProjectValidator');

const localProjectRouter = express.Router();

localProjectRouter.route('/crud').post(validateMainServer, onLocal);
localProjectRouter.route('/delete').post(validateMainServer, deleteClientProject);
localProjectRouter.route('/create-empty').post(validateMainServer, createEmpty)
localProjectRouter.route('/download/:projectId').get(validateDownload, downloadProject)

module.exports = localProjectRouter;