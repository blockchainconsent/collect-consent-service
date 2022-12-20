// (c) Copyright Merative US L.P. and others 2020-2022 
//
// SPDX-Licence-Identifier: Apache 2.0

const jslt = require("jslt");

const constants = require("./constants");
const dbHelper = require("./db-helper");
const validator = require("./validator-helper");
const { getErrorInfo } = require("../utils");

const logger = require("../config/logger").getLogger("consent-receipt-helper");

// queryConsentReceipts
const queryConsentReceipts = async (paramData) => {
  logger.info("queryConsentReceipts");

  if (!paramData) {
    throw new Error("missing all required header and query parameters");
  }
  const {
    consentCustodian,
    dataCustodian,
    dataRecipient,
    performer,
    purpose,
    datatype,
  } = paramData;

  validator.validateHelperParam(
    "queryConsentReceipts",
    `${constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID} header parameter`,
    consentCustodian
  );
  validator.validateHelperParam(
    "queryConsentReceipts",
    `${constants.REQUEST_HEADERS.DATA_CUSTODIAN_ID} header parameter`,
    dataCustodian
  );
  validator.validateHelperParam(
    "queryConsentReceipts",
    `${constants.REQUEST_HEADERS.DATA_RECIPIENT_ID} header parameter`,
    dataRecipient
  );
  validator.validateHelperParam(
    "queryConsentReceipts",
    `${constants.REQUEST_HEADERS.PERFORMER_ID} header parameter`,
    performer
  );
  validator.validateHelperParam(
    "queryConsentReceipts",
    `${constants.QUERY_PARAMS.PURPOSE} query parameter`,
    purpose
  );
  validator.validateHelperParam(
    "queryConsentReceipts",
    `${constants.QUERY_PARAMS.DATATYPE} query parameter`,
    datatype
  );

  const dbName = `${constants.RECEIPT_DB_PREFIX}-${consentCustodian}`;
  try {
    return await dbHelper.queryDocs(dbName, paramData);
  } catch (error) {
    const { errorStatus, errorMsg } = getErrorInfo(error);
    const errMsg = `Failed to queryConsentReceipts: ${errorMsg}`;
    logger.error(errMsg);
    const newError = new Error(errMsg);
    newError.status = errorStatus;
    throw newError;
  }
};

// postConsentReceipt
const postConsentReceipt = async (custodianID, receipt) => {
  logger.info("postConsentReceipt");

  validator.validateHelperParam(
    "postConsentReceipt",
    `${constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID} header parameter`,
    custodianID
  );

  if (!receipt) {
    const errMsg = `Failed at postConsentReceipt: missing consent receipt`;
    logger.error(errMsg);
    const error = new Error(errMsg);
    error.status = 400;
    throw error;
  }

  const dbName = `${constants.RECEIPT_DB_PREFIX}-${custodianID}`;
  try {
    return dbHelper.writeDoc(dbName, receipt);
  } catch (error) {
    const { errorStatus, errorMsg } = getErrorInfo(error);
    const errMsg = `Failed to postConsentReceipt: ${errorMsg}`;
    const newError = new Error(errMsg);
    logger.error(errMsg);
    newError.status = errorStatus;
    throw newError;
  }
};

// postConsentTransaction
const postConsentTransaction = async (custodianID, receiptID, action) => {
  logger.info("postConsentTransaction");

  validator.validateHelperParam(
    "postConsentTransaction",
    `${constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID} header parameter`,
    custodianID
  );

  const timestamp = Math.floor(Date.now() / 1000);
  const transactionDoc = {
    receiptID,
    action,
    timestamp,
  };

  const dbName = `${constants.TX_DB_PREFIX}-${custodianID}`;
  try {
    return await dbHelper.writeDoc(dbName, transactionDoc);
  } catch (error) {
    const { errorStatus, errorMsg } = getErrorInfo(error);
    const errMsg = `Failed to postConsentTransaction: ${errorMsg}`;
    const newError = new Error(errMsg);
    logger.error(errMsg);
    newError.status = errorStatus;
    throw newError;
  }
};

// prepareConsentPayload
const prepareConsentPayload = (consentMapper, request) => {
  logger.info("prepareConsentPayload");

  validator.validateHelperParam(
    "postConsentReceipt",
    `${constants.BODY_PARAMS.CONSENT_REQUEST} body parameter`,
    request
  );

  return jslt.transform(request, consentMapper);
};

module.exports = {
  queryConsentReceipts,
  prepareConsentPayload,
  postConsentReceipt,
  postConsentTransaction,
};
