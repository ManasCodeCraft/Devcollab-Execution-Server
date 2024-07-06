const express = require('express');
const { validateMainServer } = require('../middlewares/validateMainServer');
const { initProject, stopClientProject, reloadClientProject, startClientProject, installNodejsPackage, runNPMInstall } = require('../controllers/runNodejsControllers');

const runNodejsRouter = express.Router();

runNodejsRouter.route('/init').post(validateMainServer, initProject);
runNodejsRouter.route('/stop').post(stopClientProject)
runNodejsRouter.route('/start').post(startClientProject)
runNodejsRouter.route('/reload').post(reloadClientProject)
runNodejsRouter.route('/nodejs-package').post(installNodejsPackage)
runNodejsRouter.route('/npm-install').post(runNPMInstall);

module.exports = runNodejsRouter;