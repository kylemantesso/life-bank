
// TODO: Store securely in SSM/env vars
const client_ids = ["CBJCHBCAABAA-odTEkXQ_wPEiPMzsLVxAH9mj1j1-Mbd", "UB7E5BXCXY"];

exports.handler = function index(event, context, callback) {
    console.log("EVENT", JSON.stringify(event));



    if(event.httpMethod === "GET") {
        // Fetch client id
        var clientid = event.headers['X-AdobeSign-ClientId'] || event.headers['x-adobesign-clientid'];

        //Validate it
        if (client_ids.includes(clientid)) //Replace 'BGBQIIE7H253K6' with the client id of the application using which the webhook is created
        {

            var responseBody = {
                xAdobeSignClientId : clientid
            };

            var response = {
                statusCode: 200,
                body: JSON.stringify(responseBody),
                headers: {
                    "X-AdobeSign-ClientId": clientid
                }
            };
            callback(null,response);
        }
        else {
            callback("Oops!! illegitimate call");
        }
    }




}
