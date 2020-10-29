const fetch = require("node-fetch");

const TOKEN_ENDPOINT = "https://api.au1.echosign.com/oauth/token";

// TODO: Store securely in SSM/env vars
const client_id = "CBJCHBCAABAA-odTEkXQ_wPEiPMzsLVxAH9mj1j1-Mbd";
const client_secret = "ChFVWCmpx7HfWQT2NXA90ihZ9VJ5c9ut";

const redirect_uri =
  "https://nktf35u4xl.execute-api.ap-southeast-2.amazonaws.com/dev/adobe/redirect";

exports.handler = (event) => {
  console.log("EVENT", JSON.stringify(event));

  const code = event.queryStringParameters["code"];

  const body = `code=${code}&client_id=${client_id}&client_secret=${client_secret}&redirect_uri=${redirect_uri}&grant_type=authorization_code`;

  return fetch(TOKEN_ENDPOINT, {
    method: "POST",
    body,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  }).then((res) => res.json());
};
