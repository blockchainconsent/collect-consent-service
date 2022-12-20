// (c) Copyright Merative US L.P. and others 2020-2022 
//
// SPDX-Licence-Identifier: Apache 2.0

const { expect } = require("chai");

const credentialHelper = require("../../helpers/credential-helper");

const consentSchema = require("./testdata/consent-schema.json");
let consentSample = require("./testdata/consent-sample.json");

describe("validateConsentRequest", async () => {
  it("should succeed", async () => {
    credentialHelper.validateConsentRequest(consentSample, consentSchema);
  });

  it("should fail with empty instance", async () => {
    expect(
      credentialHelper.validateConsentRequest.bind(
        credentialHelper,
        {},
        consentSchema
      )
    ).to.throw("Failed to validate consent request");
  });

  it("should fail with invalid instance", async () => {
    expect(
      credentialHelper.validateConsentRequest.bind(
        credentialHelper,
        {
          exampleKey: "exampleValue",
        },
        consentSchema
      )
    ).to.throw("Failed to validate consent request");
  });

  it("should fail with missing required property", async () => {
    const consentSample1 = JSON.parse(JSON.stringify(consentSample));
    delete consentSample1.version;

    expect(
      credentialHelper.validateConsentRequest.bind(
        credentialHelper,
        consentSample1,
        consentSchema
      )
    ).to.throw(
      'Failed to validate consent request: instance requires property "version"'
    );
  });

  it("should fail with invalid enum value", async () => {
    const consentSample2 = JSON.parse(JSON.stringify(consentSample));
    consentSample2.jurisdiction = "invalid";

    expect(
      credentialHelper.validateConsentRequest.bind(
        credentialHelper,
        consentSample2,
        consentSchema
      )
    ).to.throw(
      "Failed to validate consent request: instance.jurisdiction is not one of enum values: US"
    );
  });

  it("should fail with invalid type", async () => {
    const consentSample3 = JSON.parse(JSON.stringify(consentSample));
    consentSample3.language = 1;

    expect(
      credentialHelper.validateConsentRequest.bind(
        credentialHelper,
        consentSample3,
        consentSchema
      )
    ).to.throw(
      "Failed to validate consent request: instance.language is not of a type(s) string"
    );
  });
});
