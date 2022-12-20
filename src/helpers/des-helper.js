// (c) Copyright Merative US L.P. and others 2020-2022 
//
// SPDX-Licence-Identifier: Apache 2.0

const axios = require("axios");
const rax = require("retry-axios");

const tlsHelper = require("./tls-helper");

const logger = require("../config/logger").getLogger("des-helper");

let baseURL;
let timeout;
let retries;
let retryDelay;

const setFromEnvironmentVariables = () => {
  baseURL = process.env.DES_API_HOSTNAME;
  timeout = process.env.DES_ID_TIMEOUT || 10000;
  retries = process.env.DES_ID_RETRIES || 3;
  retryDelay = process.env.DES_ID_RETRY_DELAY || 3000;
};

let desClient;

const getClient = () => {
  if (desClient) {
    return desClient;
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
      logger.warn("Error while performing DES request.  Retrying request:");
      logger.warn(`Retry attempt #${cfg.currentRetryAttempt}`);
    },
  };

  rax.attach(client);
  desClient = client;
  return desClient;
};

const getOrgConfig = async (orgID, token) => {
  const configEndpoint = `/organization/${orgID}`;
  const headers = {
    headers: {
      Authorization: token,
    },
  };
  logger.debug(`Attempting to get org config for ${orgID}`);

  const response = await getClient().get(configEndpoint, headers);
  return response.data.payload;
};

const getMapper = async (mapperName, token) => {
  const mapperEndpoint = `/mapper/${mapperName}`;
  const headers = {
    headers: {
      Authorization: token,
    },
  };
  logger.debug(`Attempting to get ${mapperName} mapper`);

  const response = await getClient().get(mapperEndpoint, headers);
  return response.data;
};

// TODO
const sendInvitation = async (contact) => {};

module.exports = {
  getOrgConfig,
  getMapper,
  sendInvitation,
};
