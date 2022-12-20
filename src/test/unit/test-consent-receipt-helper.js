// (c) Copyright Merative US L.P. and others 2020-2022 
//
// SPDX-Licence-Identifier: Apache 2.0

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
const { expect } = require("chai");
const sinon = require("sinon");

const constants = require("../../helpers/constants");
const dbHelper = require("../../helpers/db-helper");
const helper = require("../../helpers/consent-receipt-helper");

const consentMapper = require("./testdata/consent-mapper.json");

const consentCustodian = "consentCustodian";
const receiptID1 = "receipt1";
const request1 = {
  consentCustodian,
  dataCustodian: "dataCustodianID",
  dataRecipient: "recipientID",
  performer: "performerID",
  purpose: "purpose",
  datatype: "datatype",
};
const testAction = "collect";
const txDbName = `${constants.TX_DB_PREFIX}-${consentCustodian}`;

describe("queryConsentReceipts", async () => {
  const queryConsentReceiptsSpy = sinon.spy(helper, "queryConsentReceipts");

  afterEach(() => {
    dbHelper.queryDocs.restore();
    queryConsentReceiptsSpy.resetHistory();
  });

  it("should fail with missing all parameters", async () => {
    const queryDocsStub = sinon.stub(dbHelper, "queryDocs");

    await expect(helper.queryConsentReceipts()).to.be.rejectedWith(
      "missing all required header and query parameters"
    );

    expect(queryDocsStub.callCount).to.equal(0);
    expect(queryConsentReceiptsSpy.callCount).to.equal(1);
  });

  it("should fail with missing consent custodian ID", async () => {
    const queryDocsStub = sinon.stub(dbHelper, "queryDocs");

    const request = JSON.parse(JSON.stringify(request1));
    delete request.consentCustodian;

    await expect(helper.queryConsentReceipts(request)).to.be.rejectedWith(
      "missing x-cm-consent-custodian-id header parameter"
    );

    expect(queryDocsStub.callCount).to.equal(0);
    expect(queryConsentReceiptsSpy.callCount).to.equal(1);
  });

  it("should fail with missing data receipt ID", async () => {
    const queryDocsStub = sinon.stub(dbHelper, "queryDocs");

    const request = JSON.parse(JSON.stringify(request1));
    delete request.dataRecipient;

    await expect(helper.queryConsentReceipts(request)).to.be.rejectedWith(
      "missing x-cm-data-recipient-id header parameter"
    );

    expect(queryDocsStub.callCount).to.equal(0);
    expect(queryConsentReceiptsSpy.callCount).to.equal(1);
  });

  it("should fail with missing performer", async () => {
    const queryDocsStub = sinon.stub(dbHelper, "queryDocs");

    const request = JSON.parse(JSON.stringify(request1));
    delete request.performer;

    await expect(helper.queryConsentReceipts(request)).to.be.rejectedWith(
      "missing x-cm-performer-id header parameter"
    );

    expect(queryDocsStub.callCount).to.equal(0);
    expect(queryConsentReceiptsSpy.callCount).to.equal(1);
  });

  it("should fail with missing purpose", async () => {
    const queryDocsStub = sinon.stub(dbHelper, "queryDocs");

    const request = JSON.parse(JSON.stringify(request1));
    delete request.purpose;

    await expect(helper.queryConsentReceipts(request)).to.be.rejectedWith(
      "missing purpose query param"
    );

    expect(queryDocsStub.callCount).to.equal(0);
    expect(queryConsentReceiptsSpy.callCount).to.equal(1);
  });

  it("should fail with missing datatype", async () => {
    const queryDocsStub = sinon.stub(dbHelper, "queryDocs");

    const request = JSON.parse(JSON.stringify(request1));
    delete request.datatype;

    await expect(helper.queryConsentReceipts(request)).to.be.rejectedWith(
      "missing datatype query param"
    );

    expect(queryDocsStub.callCount).to.equal(0);
    expect(queryConsentReceiptsSpy.callCount).to.equal(1);
  });

  it("should fail with queryDocs error", async () => {
    const error = new Error("Internal Server Error");
    const queryDocsStub = sinon.stub(dbHelper, "queryDocs").throws(error);

    await expect(helper.queryConsentReceipts(request1)).to.be.rejectedWith(
      "Internal Server Error"
    );

    expect(queryDocsStub.callCount).to.equal(1);
    expect(queryConsentReceiptsSpy.callCount).to.equal(1);
  });

  it("should succeed", async () => {
    const docs = [{ receiptID1: "doc" }, { requestID2: "doc" }];

    const queryDocsStub = sinon.stub(dbHelper, "queryDocs").returns(docs);

    const result = await helper.queryConsentReceipts(request1);

    expect(result).to.eq(docs);
    expect(queryDocsStub.callCount).to.equal(1);
    expect(queryConsentReceiptsSpy.callCount).to.equal(1);
  });
});

describe("postConsentReceipt", async () => {
  const postConsentReceiptSpy = sinon.spy(helper, "postConsentReceipt");

  afterEach(() => {
    dbHelper.writeDoc.restore();
    postConsentReceiptSpy.resetHistory();
  });

  it("should fail with missing consent custodian ID", async () => {
    const writeDocStub = sinon.stub(dbHelper, "writeDoc");

    await expect(helper.postConsentReceipt()).to.be.rejectedWith(
      "missing x-cm-consent-custodian-id header parameter"
    );

    expect(writeDocStub.callCount).to.equal(0);
    expect(postConsentReceiptSpy.callCount).to.equal(1);
  });

  it("should fail with missing consent receipt", async () => {
    const writeDocStub = sinon.stub(dbHelper, "writeDoc");

    await expect(
      helper.postConsentReceipt(consentCustodian)
    ).to.be.rejectedWith("missing consent receipt");

    expect(writeDocStub.callCount).to.equal(0);
    expect(postConsentReceiptSpy.callCount).to.equal(1);
  });

  it("should fail with writeDoc error", async () => {
    const error = new Error("Internal Server Error");
    const writeDocStub = sinon.stub(dbHelper, "writeDoc").throws(error);

    await expect(
      helper.postConsentReceipt(consentCustodian, request1)
    ).to.be.rejectedWith("Internal Server Error");

    expect(writeDocStub.callCount).to.equal(1);
    expect(postConsentReceiptSpy.callCount).to.equal(1);
  });

  it("should succeed", async () => {
    const writeDocStub = sinon.stub(dbHelper, "writeDoc");

    await helper.postConsentReceipt(consentCustodian, request1);
    expect(writeDocStub.callCount).to.equal(1);
    expect(postConsentReceiptSpy.callCount).to.equal(1);
  });
});

describe("prepareConsentPayload", async () => {
  it("should fail with missing consent request", async () => {
    expect(helper.prepareConsentPayload.bind(helper, consentMapper)).to.throw(
      "missing consentRequest body parameter"
    );
  });

  it("should succeed", async () => {
    const payload = helper.prepareConsentPayload(consentMapper, request1);
    expect(payload).to.be.not.empty;
    // TODO: update fields to check based on consent schema
    expect(payload).to.have.property("principal");
    expect(payload.principal).to.have.property("id");
    expect(payload.principal.id).to.equal(request1.performer);
    expect(payload).to.have.property("controller");
    expect(payload.controller).to.have.property("name");
    expect(payload.controller.name).to.equal(request1.dataCustodian);
    expect(payload).to.have.property("services");
    expect(payload.services).to.have.lengthOf(1);
    expect(payload.services[0]).to.have.property("purposes");
    expect(payload.services[0].purposes).to.have.lengthOf(1);
    expect(payload.services[0].purposes[0]).to.have.property("description");
    expect(payload.services[0].purposes[0].description).to.equal(
      request1.purpose
    );
  });
});

describe("postConsentTransaction (invalid)", async () => {
  const postConsentTransactionSpy = sinon.spy(helper, "postConsentTransaction");

  afterEach(() => {
    dbHelper.writeDoc.restore();
    postConsentTransactionSpy.resetHistory();
  });

  it("should fail with missing consent custodian ID", async () => {
    const writeDocStub = sinon.stub(dbHelper, "writeDoc");

    await expect(helper.postConsentTransaction()).to.be.rejectedWith(
      "missing x-cm-consent-custodian-id header parameter"
    );

    expect(writeDocStub.callCount).to.equal(0);
    expect(postConsentTransactionSpy.callCount).to.equal(1);
  });

  it("should fail with writeDoc error", async () => {
    const error = new Error("Internal Server Error");
    const writeDocStub = sinon.stub(dbHelper, "writeDoc").throws(error);

    await expect(
      helper.postConsentTransaction(consentCustodian, receiptID1)
    ).to.be.rejectedWith("Internal Server Error");

    expect(writeDocStub.callCount).to.equal(1);
    expect(postConsentTransactionSpy.callCount).to.equal(1);
  });
});

describe("postConsentTransaction (valid)", async () => {
  it("should succeed", async () => {
    const consentReceipt = await helper.postConsentTransaction(
      consentCustodian,
      receiptID1,
      testAction
    );

    // check DB for doc
    const testTransaction = await dbHelper.queryDoc(
      txDbName,
      consentReceipt.docID
    );
    expect(testTransaction).to.not.be.empty;
    expect(testTransaction.docID).to.equal(consentReceipt.docID);
    expect(testTransaction.receiptID).to.equal(receiptID1);
    expect(testTransaction.action).to.equal(testAction);
    expect(testTransaction.timestamp).to.be.greaterThan(0);
  });
});
