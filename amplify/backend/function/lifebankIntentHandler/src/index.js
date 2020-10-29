var AWS = require('aws-sdk');
AWS.config.region = 'ap-southeast-2';
var lambda = new AWS.Lambda();

exports.handler = ({ currentIntent }, context, callback) => {
  console.log(currentIntent);

  const data = {
      id: guid(),
      submitted: Date.now(),
      submissionStatus: "submitted",
      name: currentIntent.slots.Name,
      advisedNotGiveBlood: currentIntent.slots.advisedNotGiveBlood === "Yes",
      dob: currentIntent.slots.dob,
      donatedBloodBefore: currentIntent.slots.donatedBloodBefore === "Yes",
      email: currentIntent.slots.email,
      healthConditions: currentIntent.slots.healthConditions === "Yes",
      outsideCountry: currentIntent.slots.outsideCountry === "Yes",
  };

  console.log(JSON.stringify(data));

  lambda.invoke({
    FunctionName: 'submissionFunction-dev',
    InvocationType: 'Event',
    Payload: JSON.stringify({
      resource: "/submission",
      path: "/submission",
      "httpMethod": "POST",
      "headers": {
        'Content-Type':'application/json;charset=UTF-8'
      },
        "body": JSON.stringify(data)
    })
  },function(err,data){
    if(err) {
      console.log("ERROR", err);
      callback(err);
    }
    console.log("DATA", data)
    callback(null, getCloseResponse())
  });
};

const getCloseResponse = () => ({
  dialogAction: {
    type: "Close",
    fulfillmentState: "Fulfilled",
    message: {
      contentType: "PlainText",
      content:
        "Thanks, you will receive an email shortly to confirm your answers.",
    },
  },
});

const guid = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

