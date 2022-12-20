// (c) Copyright Merative US L.P. and others 2020-2022 
//
// SPDX-Licence-Identifier: Apache 2.0

const nock = require("nock");

const credential = require("./testdata/credential-sample.json");
const schema = require("./testdata/consent-schema.json");
const mapper = require("./testdata/consent-mapper.json");
const orgConfig = require("./testdata/org-config.json");

const desHost = "http://localhost:3001";
const hpassHost = "http://localhost:3002";

process.env.DES_API_HOSTNAME = desHost;
process.env.HPASS_API_HOSTNAME = hpassHost;

const consentCustodian1 = "consentCustodian1";

const setupDesNocks = () => {
  nock(desHost, { allowUnmocked: false })
    .persist()
    .get(`/organization/${consentCustodian1}`)
    .reply(200, orgConfig);

  nock(desHost, { allowUnmocked: false })
    .persist()
    .get("/mapper/consentMapper")
    .reply(200, mapper);
};

const setupHpassNocks = () => {
  nock(hpassHost, { allowUnmocked: false })
    .persist()
    .post("/credentials?type=string")
    .reply(200, {
      message: credential.message,
      payload: credential.payload,
    });

  nock(hpassHost, { allowUnmocked: false })
    .persist()
    .get(`/schema/${orgConfig.payload.consentInfo.schemaId}`)
    .reply(200, {
      message: "Successfully retrieved schema information",
      type: "schema",
      payload: {
        id: orgConfig.payload.consentInfo.schemaId,
        schema,
      },
    });
};

module.exports = {
  setupDesNocks,
  setupHpassNocks,
};
