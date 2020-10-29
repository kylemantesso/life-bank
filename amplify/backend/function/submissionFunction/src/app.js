/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/
const fetch = require("node-fetch");
const fs = require("fs");

const API_ENDPOINT = "https://api.au1.echosign.com";
const REFRESH_ENDPOINT = "https://api.au1.echosign.com/oauth/refresh";
const DONOR_FORM_TEMPLATE_ID = "CBJCHBCAABAAgnRbWsngbkaeHjAp55p9HWg1TU2yVqbS";

// TODO: Store securely in SSM/env vars
const client_id = "CBJCHBCAABAA-odTEkXQ_wPEiPMzsLVxAH9mj1j1-Mbd";
const client_secret = "ChFVWCmpx7HfWQT2NXA90ihZ9VJ5c9ut";
const refresh_token =
  "3AAABLblqZhBz0lPtLE-nvxtA3qmFdNWCKUqdGLA5boXVWaNS8e_emAC3xItZxEA_rdjBfmGpBu0*";

const fetchAccessToken = async () => {
  const body = `refresh_token=${refresh_token}&client_id=${client_id}&client_secret=${client_secret}&grant_type=refresh_token`;
  const { access_token } = await fetch(REFRESH_ENDPOINT, {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
    .then((res) => res.json())
    .catch((err) => {
      console.log("ACCESS TOKEN ERROR", err);
    });

  console.log("ACCESS_TOKEN", access_token);

  return access_token;
};

const AWS = require("aws-sdk");
var awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
var bodyParser = require("body-parser");
var express = require("express");

AWS.config.update({ region: process.env.TABLE_REGION });

const dynamodb = new AWS.DynamoDB.DocumentClient();

let tableName = "submissions";
if (process.env.ENV && process.env.ENV !== "NONE") {
  tableName = tableName + "-" + process.env.ENV;
}

const userIdPresent = false; // TODO: update in case is required to use that definition
const partitionKeyName = "id";
const partitionKeyType = "S";
const sortKeyName = "";
const sortKeyType = "";
const hasSortKey = sortKeyName !== "";
const path = "/submission";
const UNAUTH = "UNAUTH";
const hashKeyPath = "/:" + partitionKeyName;
const sortKeyPath = hasSortKey ? "/:" + sortKeyName : "";
// declare a new express app
var app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// convert url string param to expected Type
const convertUrlType = (param, type) => {
  switch (type) {
    case "N":
      return Number.parseInt(param);
    default:
      return param;
  }
};

// Return all
app.get(path, (req, res) => {
  let params = {
    TableName: tableName,
  };

  dynamodb.scan(params, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: err, url: req.url, body: req.body });
    } else {
      res.json(data.Items);
    }
  });
});

/********************************
 * HTTP Get method for list objects *
 ********************************/

app.get(path + "/download", async (req, res) => {
  const { id } = req.query;
  // /agreements/{agreementId}/combinedDocument
  const accessToken = await fetchAccessToken();

  let adobeResponse;
  try {
    adobeResponse = await fetch(
      API_ENDPOINT + `/api/rest/v6/agreements/${id}/combinedDocument/url`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      }
    ).then(res => res.json());
    console.log("SUCCESS", adobeResponse);
  } catch (err) {
    console.log("ERROR", err);
  }

  res.json(adobeResponse);


  // console.log("BODY", adobeResponse.body);
  //
  // const fileStream = fs.createWriteStream("/tmp/download.pdf");
  // await new Promise((resolve, reject) => {
  //   adobeResponse.body.pipe(fileStream);
  //   adobeResponse.body.on("error", (err) => {
  //     console.log("file error", err);
  //
  //     reject(err);
  //   });
  //   fileStream.on("finish", function () {
  //     console.log("file done");
  //     resolve();
  //   });
  // });
  //
  // var stats = fs.statSync("/tmp/download.pdf");
  // var fileSizeInBytes = stats["size"];
  // //Convert the file size to megabytes (optional)
  // var fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
  //
  // console.log("SIZE IN MB", fileSizeInMegabytes);
  //
  // res.download("/tmp/download.pdf", function (err) {
  //   if (err) {
  //     console.log("Error");
  //     console.log(err);
  //   } else {
  //     console.log("Success");
  //   }
  // });
});

app.get(path + hashKeyPath, function (req, res) {
  var condition = {};
  condition[partitionKeyName] = {
    ComparisonOperator: "EQ",
  };

  if (userIdPresent && req.apiGateway) {
    condition[partitionKeyName]["AttributeValueList"] = [
      req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH,
    ];
  } else {
    try {
      condition[partitionKeyName]["AttributeValueList"] = [
        convertUrlType(req.params[partitionKeyName], partitionKeyType),
      ];
    } catch (err) {
      res.statusCode = 500;
      res.json({ error: "Wrong column type " + err });
    }
  }

  let queryParams = {
    TableName: tableName,
    KeyConditions: condition,
  };

  dynamodb.query(queryParams, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: "Could not load items: " + err });
    } else {
      res.json(data.Items);
    }
  });
});

/*****************************************
 * HTTP Get method for get single object *
 *****************************************/

app.get(path + "/object" + hashKeyPath + sortKeyPath, function (req, res) {
  var params = {};
  if (userIdPresent && req.apiGateway) {
    params[partitionKeyName] =
      req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  } else {
    params[partitionKeyName] = req.params[partitionKeyName];
    try {
      params[partitionKeyName] = convertUrlType(
        req.params[partitionKeyName],
        partitionKeyType
      );
    } catch (err) {
      res.statusCode = 500;
      res.json({ error: "Wrong column type " + err });
    }
  }
  if (hasSortKey) {
    try {
      params[sortKeyName] = convertUrlType(
        req.params[sortKeyName],
        sortKeyType
      );
    } catch (err) {
      res.statusCode = 500;
      res.json({ error: "Wrong column type " + err });
    }
  }

  let getItemParams = {
    TableName: tableName,
    Key: params,
  };

  dynamodb.get(getItemParams, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: "Could not load items: " + err.message });
    } else {
      if (data.Item) {
        res.json(data.Item);
      } else {
        res.json(data);
      }
    }
  });
});

/************************************
 * HTTP put method for insert object *
 *************************************/

app.put(path, function (req, res) {
  if (userIdPresent) {
    req.body["userId"] =
      req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  }

  let putItemParams = {
    TableName: tableName,
    Item: JSON.parse(req.body),
  };
  dynamodb.put(putItemParams, (err, data) => {
    if (err) {
      res.statusCode = 500;

      res.json({ error: err, url: req.url, body: req.body });
    } else {
      res.json({ success: "put call succeed!", url: req.url, data: data });
    }
  });
});

/************************************
 * HTTP post method for insert object *
 *************************************/

app.post(path, function (req, res) {
  console.log("Running", path)

  if (userIdPresent) {
    req.body["userId"] =
      req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  }

  console.log("REQ BODY", req.body);

  let putItemParams = {
    TableName: tableName,
    Item: req.body,
  };


  console.log("PUT ITEM PARAMS", putItemParams);


  dynamodb.put(putItemParams, (err, data) => {
    if (err) {
      console.log("DYNAMO ERROR", err);
      res.statusCode = 500;
      res.json({ error: err, url: req.url, body: req.body });
    } else {
      console.log("DYNAMO SUCCESS", data);
      res.json({ success: "post call succeed!", url: req.url, data: data });
    }
  });
});

app.post(path + "/send", async function (req, res) {
  console.log("Running", path + "/send")

  const body = req.body;
  const accessToken = await fetchAccessToken();

  const adobeRequest = {
    signatureType: "ESIGN",
    state: "IN_PROCESS",
    fileInfos: [
      {
        libraryDocumentId: DONOR_FORM_TEMPLATE_ID,
      },
    ],
    name: "Donor questionnaire",
    mergeFieldInfo: [
      {
        fieldName: "donatedBloodBefore",
        defaultValue: body.submission.donatedBloodBefore,
      },
      {
        fieldName: "advisedNotGiveBlood",
        defaultValue: body.submission.advisedNotGiveBlood,
      },
      {
        fieldName: "outsideCountry",
        defaultValue: body.submission.outsideCountry,
      },
      {
        fieldName: "healthConditions",
        defaultValue: body.submission.healthConditions,
      },
      {
        fieldName: "name",
        defaultValue: body.submission.name,
      },
      {
        fieldName: "doctorName",
        defaultValue: body.doctorName,
      },
      {
        fieldName: "dob",
        defaultValue: body.submission.dob,
      },
    ],
    participantSetsInfo: [
      {
        memberInfos: [
          {
            email: body.submission.email,
          },
        ],
        order: 1,
        role: "SIGNER",
      },
      {
        memberInfos: [
          {
            email: body.doctorEmail,
          },
        ],
        order: 2,
        role: "SIGNER",
      },
    ],
  };

  let adobeResponse;
  try {
    adobeResponse = await fetch(API_ENDPOINT + "/api/rest/v6/agreements", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(adobeRequest),
    }).then((res) => res.json());
    console.log("SUCCESS", adobeResponse);
  } catch (err) {
    console.log("ERROR", err);
  }

  const params = {
    TableName: tableName,
    Key: {
      id: body.id,
    },
    UpdateExpression:
      "set submissionStatus = :s, doctorName = :d, doctorEmail =:e, sent = :r, agreementId = :a",
    ExpressionAttributeValues: {
      ":s": "sent",
      ":d": body.doctorName,
      ":e": body.doctorEmail,
      ":r": Date.now(),
      ":a": adobeResponse.id,
    },
    ReturnValues: "UPDATED_NEW",
  };

  dynamodb.update(params, function (err, data) {
    if (err) {
      console.error(
        "Unable to update item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
      res.statusCode = 500;
      res.json({ error: err, url: req.url, body: req.body });
    } else {
      console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
      res.json(data);
    }
  });
});

/**************************************
 * HTTP remove method to delete object *
 ***************************************/

app.delete(path + "/object" + hashKeyPath + sortKeyPath, function (req, res) {
  var params = {};
  if (userIdPresent && req.apiGateway) {
    params[partitionKeyName] =
      req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH;
  } else {
    params[partitionKeyName] = req.params[partitionKeyName];
    try {
      params[partitionKeyName] = convertUrlType(
        req.params[partitionKeyName],
        partitionKeyType
      );
    } catch (err) {
      res.statusCode = 500;
      res.json({ error: "Wrong column type " + err });
    }
  }
  if (hasSortKey) {
    try {
      params[sortKeyName] = convertUrlType(
        req.params[sortKeyName],
        sortKeyType
      );
    } catch (err) {
      res.statusCode = 500;
      res.json({ error: "Wrong column type " + err });
    }
  }

  let removeItemParams = {
    TableName: tableName,
    Key: params,
  };
  dynamodb.delete(removeItemParams, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.json({ error: err, url: req.url });
    } else {
      res.json({ url: req.url, data: data });
    }
  });
});
app.listen(3000, function () {
  console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
