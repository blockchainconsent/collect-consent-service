// (c) Copyright Merative US L.P. and others 2020-2022 
//
// SPDX-Licence-Identifier: Apache 2.0

// TODO: Cloudent returns status as err.statusCode and the message as err.error.
// We may need to handle this differently if we use something besides Cloudent

const { v4: uuidv4 } = require("uuid");

const { getErrorInfo } = require("../utils");

const logger = require("../config/logger").getLogger("db-helper");

// TODO: replace in-memory docs with actual implementation
const inMemoryDocs = new Map();

const getInMemoryDoc = (dbName, docID) => {
  if (!inMemoryDocs.has(dbName)) {
    const error = new Error(
      `Document with id ${docID} not found in database ${dbName}`
    );
    error.status = 404;
    throw error;
  }

  const dbDocs = inMemoryDocs.get(dbName);

  if (!dbDocs.has(docID)) {
    const error = new Error(
      `Document with id ${docID} not found in database ${dbName}`
    );
    error.status = 404;
    throw error;
  }

  return dbDocs.get(docID);
};

const queryDoc = async (dbName, docID) => {
  logger.info(`queryDoc ${docID} from ${dbName} database`);

  return getInMemoryDoc(dbName, docID);
  /*
  try {
    // TODO: query doc from database
  } catch (error) {
      let errMsg = `Error querying doc from database: ${error.message}`;
      logger.error(errMsg);
      throw new Error(errMsg);
  }
  */
};

// TODO: Find out the actual params needed to query
const queryDocs = async (dbName, paramData) => {
  logger.info(
    `queryDocs from ${dbName} database with parameters:`,
    JSON.stringify(paramData)
  );

  return [
    {
      docID1: "doc",
      docID2: "doc",
    },
  ];
};

const writeDoc = async (dbName, doc, docID) => {
  logger.info(`writeDoc to ${dbName} database`);

  try {
    if (!inMemoryDocs.has(dbName)) {
      inMemoryDocs.set(dbName, new Map());
    }
    const dbDocs = inMemoryDocs.get(dbName);
    doc.docID = docID || uuidv4();
    dbDocs.set(doc.docID, doc);
    return doc;
  } catch (error) {
    const { errorStatus, errorMsg } = getErrorInfo(error);
    const errMsg = `Error writing doc to database: ${errorMsg}`;
    logger.error(errMsg);
    const newError = new Error(errMsg);
    newError.status = errorStatus;
    throw newError;
  }
};

const putDoc = async (dbName, docID, doc) => {
  logger.info(`putDoc ${docID} to ${dbName} database`);
  try {
    // Checks if doc exists
    getInMemoryDoc(dbName, docID);

    inMemoryDocs.get(dbName).set(docID, doc);
  } catch (error) {
    const { errorStatus, errorMsg } = getErrorInfo(error);
    const errMsg = `Error updating doc in database: ${errorMsg}`;
    logger.error(errMsg);
    const newError = new Error(errMsg);
    newError.status = errorStatus;
    throw newError;
  }
};

const deleteDoc = async (dbName, docID) => {
  logger.info(`deleteDoc ${docID} from ${dbName} database`);
  try {
    // Check if doc exists
    getInMemoryDoc(dbName, docID);

    inMemoryDocs.get(dbName).delete(docID);
  } catch (error) {
    const { errorStatus, errorMsg } = getErrorInfo(error);
    const errMsg = `Error deleting doc from database: ${errorMsg}`;
    logger.error(errMsg);
    const newError = new Error(errMsg);
    newError.status = errorStatus;
    throw newError;
  }
};

module.exports = {
  queryDoc,
  queryDocs,
  writeDoc,
  putDoc,
  deleteDoc,
};
