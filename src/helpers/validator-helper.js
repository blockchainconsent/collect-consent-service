// (c) Copyright Merative US L.P. and others 2020-2022 
//
// SPDX-Licence-Identifier: Apache 2.0

const logger = require("../config/logger").getLogger("validator-helper");

const validateHelperParam = (funcName, paramName, paramValue) => {
  if (!paramValue) {
    const errMsg = `Failed at ${funcName}: missing ${paramName}`;
    logger.error(errMsg);
    const error = new Error(errMsg);
    error.status = 400;
    throw error;
  }
};

module.exports = {
  validateHelperParam
};
