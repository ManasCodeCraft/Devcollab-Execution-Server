const express = require('express');
const { validateExecNodejsProgram } = require('../middlewares/runProgramValidators');
const { runNodejsProgram, killNodejsProgram, htmlPreview } = require('../controllers/runProgramController');

const runProgramRouter = express.Router();

runProgramRouter.route('/nodejs').post(validateExecNodejsProgram, runNodejsProgram);
runProgramRouter.route('/stop-nodejs').post(killNodejsProgram);
runProgramRouter.route('/html-preview/:projectId/:fileId').get(htmlPreview)

module.exports = runProgramRouter;