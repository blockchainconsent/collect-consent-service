// (c) Copyright Merative US L.P. and others 2020-2022 
//
// SPDX-Licence-Identifier: Apache 2.0

const dbHelper = require("./db-helper");
const validator = require("./validator-helper");
const constants = require("./constants");
const { getErrorInfo } = require("../utils");

const logger = require("../config/logger").getLogger("consent-request-helper");

// getConsentRequest
const getConsentRequest = async (custodianID, requestID) => {
  logger.info(`getConsentRequest ${requestID}`);

  validator.validateHelperParam(
    "getConsentRequest",
    "consent custodian ID",
    custodianID
  );
  validator.validateHelperParam(
    "getConsentRequest",
    "consent request ID",
    requestID
  );

  const dbName = `${constants.REQUEST_DB_PREFIX}-${custodianID}`;
  try {
    return await dbHelper.queryDoc(dbName, requestID);
  } catch (error) {
    const { errorStatus, errorMsg } = getErrorInfo(error);
    const errMsg = `Failed to getConsentRequest: ${errorMsg}`;
    logger.error(errMsg);
    const newError = new Error(errMsg);
    newError.status = errorStatus;
    throw newError;
  }
};

const postConsentRequest = async (custodianID, consentRequest) => {
  logger.info("postConsentRequest");

  const dbName = `${constants.REQUEST_DB_PREFIX}-${custodianID}`;
  try {
    validator.validateHelperParam(
      "postConsentRequest",
      "consent custodian ID header parameter",
      custodianID
    );
    validator.validateHelperParam(
      "postConsentRequest",
      "consent request in request body",
      consentRequest
    );

    const { dataCustodian, dataRecipient, performer, purpose, datatype } =
      consentRequest;

    validator.validateHelperParam(
      "postConsentRequest",
      "data custodian in request body",
      dataCustodian
    );
    validator.validateHelperParam(
      "postConsentRequest",
      "data recipient in request body",
      dataRecipient
    );
    validator.validateHelperParam(
      "postConsentRequest",
      "performer in request body",
      performer
    );
    validator.validateHelperParam(
      "postConsentRequest",
      "purpose in request body",
      purpose
    );
    validator.validateHelperParam(
      "postConsentRequest",
      "data type in request body",
      datatype
    );

    consentRequest.status = constants.CONSENT_REQUEST_STATUS.PENDING;
    consentRequest.createdAt = new Date().toISOString();
    return dbHelper.writeDoc(dbName, consentRequest);
  } catch (error) {
    const { errorStatus, errorMsg } = getErrorInfo(error);
    const errMsg = `Failed to postConsentRequest: ${errorMsg}`;
    logger.error(error.message);
    const newError = new Error(errMsg);
    newError.status = errorStatus;
    throw newError;
  }
};

// deleteConsentRequest
const deleteConsentRequest = async (custodianID, requestID) => {
  logger.info(`deleteConsentRequest ${requestID}`);

  validator.validateHelperParam(
    "deleteConsentRequest",
    "consent custodian ID",
    custodianID
  );
  validator.validateHelperParam(
    "deleteConsentRequest",
    "consent request docID",
    requestID
  );

  const dbName = `${constants.REQUEST_DB_PREFIX}-${custodianID}`;
  try {
    await dbHelper.deleteDoc(dbName, requestID);
  } catch (error) {
    const { errorStatus, errorMsg } = getErrorInfo(error);
    const errMsg = `Failed to deleteConsentRequest: ${errorMsg}`;
    logger.error(errMsg);
    const newError = new Error(errMsg);
    newError.status = errorStatus;
    throw newError;
  }
};

module.exports = {
  getConsentRequest,
  postConsentRequest,
  deleteConsentRequest,
};
