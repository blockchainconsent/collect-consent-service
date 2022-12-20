// (c) Copyright Merative US L.P. and others 2020-2022 
//
// SPDX-Licence-Identifier: Apache 2.0

const axios = require("axios");
const rax = require("retry-axios");

const constants = require("./constants");
const tlsHelper = require("./tls-helper");

const logger = require("../config/logger").getLogger("hpass-helper");

let baseURL;
let timeout;
let retries;
let retryDelay;

const setFromEnvironmentVariables = () => {
  baseURL = process.env.HPASS_API_HOSTNAME;
  timeout = process.env.HPASS_ID_TIMEOUT || 10000;
  retries = process.env.HPASS_ID_RETRIES || 3;
  retryDelay = process.env.HPASS_ID_RETRY_DELAY || 3000;
};

let hpassClient;

const getClient = () => {
  if (hpassClient) {
    return hpassClient;
  }
  setFromEnvironmentVariables();

  const client = axios.create({
    baseURL,
    timeout,
    httpsAgent: tlsHelper.getAgentHeaderForSelfSignedCerts(),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  // setup retry-axios config
  client.defaults.raxConfig = {
    instance: client,
    retry: retries,
    noResponseRetries: retries, // retry when no response received (such as on ETIMEOUT)
    statusCodesToRetry: [[500, 599]], // retry only on 5xx responses (no retry on 4xx responses)
    httpMethodsToRetry: ["POST", "GET", "DELETE", "PUT"],
    backoffType: "static", // options are "exponential" (default), "static" or "linear"
    retryDelay,
    onRetryAttempt: (err) => {
      const cfg = rax.getConfig(err);
      logger.warn("Error while performing Hpass request.  Retrying request:");
      logger.warn(`Retry attempt #${cfg.currentRetryAttempt}`);
    },
  };

  rax.attach(client);
  hpassClient = client;
  return hpassClient;
};

const createCredential = async (issuerID, schemaID, data, token) => {
  logger.debug("createCredential()");

  const createCredentialPath = "/credentials?type=string";

  const credentialReqBody = {
    schemaID,
    data,
    type: [],
  };

  if (data.expirationDate) {
    credentialReqBody.expirationDate = data.expirationDate;
    logger.debug("Requesting to generate a new credential with expirationDate");
  }

  const response = await getClient().post(
    createCredentialPath,
    credentialReqBody,
    {
      headers: {
        Authorization: token,
        [constants.REQUEST_HEADERS.ISSUER_ID]: issuerID,
      },
    }
  );

  return response.data.payload;
};

const getSchema = async (issuerID, schemaID, token) => {
  const schemaEndpoint = `/schema/${schemaID}`;
  const headers = {
    headers: {
      Authorization: token,
      [constants.REQUEST_HEADERS.ISSUER_ID]: issuerID,
    },
  };
  logger.debug(`Attempting to get ${schemaID} schemaID`);

  const response = await getClient().get(schemaEndpoint, headers);
  return response.data.payload.schema;
};

module.exports = {
  createCredential,
  getSchema,
};
