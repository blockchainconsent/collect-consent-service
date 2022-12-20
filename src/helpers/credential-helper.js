// (c) Copyright Merative US L.P. and others 2020-2022 
//
// SPDX-Licence-Identifier: Apache 2.0

const { validate } = require("jsonschema");

const logger = require("../config/logger").getLogger("credential-helper");

const constants = require("./constants");
const validator = require("./validator-helper");
const desHelper = require("./des-helper");
const hpassHelper = require("./hpass-helper");

// getOrgConfig
const getOrgConfig = async (orgID, token) => {
  logger.info("getOrgConfig");

  validator.validateHelperParam(
    "getOrgConfig",
    `${constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID} header parameter`,
    orgID
  );

  const orgConfig = await desHelper.getOrgConfig(orgID, token);

  return {
    orgID,
    issuerID: orgConfig.issuerId,
    consentSchemaID: orgConfig.consentInfo.schemaId,
    consentMapperName: orgConfig.consentInfo.mapper,
  };
};

const getConsentMapper = async (mapperName, token) => {
  logger.info("getConsentMapper");

  return desHelper.getMapper(mapperName, token);
};

// issueCredential
const issueCredential = async (orgID, issuerID, schemaID, payload, token) => {
  logger.info("issueCredential");

  validator.validateHelperParam(
    "issueCredential",
    `${constants.REQUEST_HEADERS.CONSENT_CUSTODIAN_ID} header parameter`,
    orgID
  );

  return hpassHelper.createCredential(issuerID, schemaID, payload, token);
};

// TODO: do we need additional checks? tests were passing on the wrong field
const validateConsentRequest = (instance, schema) => {
  const validatorResult = validate(instance, schema);
  if (validatorResult.errors.length) {
    const errMsg = `Failed to validate consent request: ${validatorResult.errors[0].stack}`;
    logger.error(errMsg);
    const error = new Error(errMsg);
    error.status = 400;
    throw error;
  }
};

module.exports = {
  getOrgConfig,
  getConsentMapper,
  issueCredential,
  validateConsentRequest,
};
