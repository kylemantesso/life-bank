const fetch = require("node-fetch");

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
  }).then((res) => res.json()).catch((err) => {
    console.log("ACCESS TOKEN ERROR", err);
  })

  console.log("ACCESS_TOKEN", access_token);

  return access_token;
};

exports.handler = async function (event, context) {
  console.log(JSON.stringify(event, null, 2));
  // const accessToken = await fetchAccessToken();
  //
  // for(const record of event.Records) {
  //   console.log(record.eventID);
  //   console.log(record.eventName);
  //   console.log("DynamoDB Record: %j", record.dynamodb);
  //
  //   if (
  //     record.eventName === "MODIFY" &&
  //     record.dynamodb.NewImage.submissionStatus.S === "sent"
  //   ) {
  //
  //     const body = {
  //       signatureType: "ESIGN",
  //       state: "IN_PROCESS",
  //       fileInfos: [
  //         {
  //           libraryDocumentId: DONOR_FORM_TEMPLATE_ID,
  //         },
  //       ],
  //       name: "Donor questionnaire",
  //       mergeFieldInfo: [
  //         {
  //           fieldName: "donatedBloodBefore",
  //           defaultValue: record.dynamodb.NewImage.donatedBloodBefore.BOOL
  //             ? "Yes"
  //             : "No",
  //         },
  //         {
  //           fieldName: "advisedNotGiveBlood",
  //           defaultValue: record.dynamodb.NewImage.advisedNotGiveBlood.BOOL
  //             ? "Yes"
  //             : "No",
  //         },
  //         {
  //           fieldName: "outsideCountry",
  //           defaultValue: record.dynamodb.NewImage.outsideCountry.BOOL
  //             ? "Yes"
  //             : "No",
  //         },
  //         {
  //           fieldName: "healthConditions",
  //           defaultValue: record.dynamodb.NewImage.healthConditions.BOOL
  //             ? "Yes"
  //             : "No",
  //         },
  //         {
  //           fieldName: "name",
  //           defaultValue: record.dynamodb.NewImage.name.S,
  //         },
  //         {
  //           fieldName: "doctorName",
  //           defaultValue: record.dynamodb.NewImage.doctorName.S,
  //         },
  //         {
  //           fieldName: "dob",
  //           defaultValue: record.dynamodb.NewImage.dob.S,
  //         },
  //       ],
  //       participantSetsInfo: [
  //         {
  //           memberInfos: [
  //             {
  //               email: record.dynamodb.NewImage.email.S,
  //             },
  //           ],
  //           order: 1,
  //           role: "SIGNER",
  //         },
  //         {
  //           memberInfos: [
  //             {
  //               email: record.dynamodb.NewImage.doctorEmail.S,
  //             },
  //           ],
  //           order: 2,
  //           role: "SIGNER",
  //         },
  //       ],
  //     };
  //
  //     console.log("BODY", JSON.stringify(body));
  //
  //     console.log("ENDPOINT", API_ENDPOINT + "/api/rest/v6/agreements");
  //
  //
  //     try {
  //       const res = await fetch(API_ENDPOINT + "/api/rest/v6/agreements", {
  //         method: "POST",
  //         headers: {
  //           "Authorization": "Bearer " + accessToken,
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(body)
  //       });
  //       console.log("SUCCESS", res);
  //     } catch(err) {
  //       console.log("ERROR", err);
  //     }
  //   }
  // }
  context.done(null, "Successfully processed DynamoDB record"); // SUCCESS with message
};
