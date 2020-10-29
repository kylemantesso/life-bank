import React from "react";
import { API } from "aws-amplify";
import { ChatBot } from "aws-amplify-react";
import { guid } from "../../../util/guid";
import { Page } from "../../Page/Page";
import { Box, Header, Heading, Text } from "grommet";
import { Favorite } from "grommet-icons";

export const Chatbot = () => {
  const handleOnComplete = async (err, confirmation) => {
    console.log("complete", err, confirmation);

    const data = {
      body: {
        id: guid(),
        submitted: Date.now(),
        submissionStatus: "submitted",
        name: confirmation.slots.Name,
        advisedNotGiveBlood: confirmation.slots.advisedNotGiveBlood === "Yes",
        dob: confirmation.slots.dob,
        donatedBloodBefore: confirmation.slots.donatedBloodBefore === "Yes",
        email: confirmation.slots.email,
        healthConditions: confirmation.slots.healthConditions === "Yes",
        outsideCountry: confirmation.slots.outsideCountry === "Yes",
      },
    };

    const res = await API.post("submissionApi", "/submission", data);
    console.log({ res });
  };

  return (
    <>
      <Header background="brand" pad="medium">
        <Box direction="row" align="center" gap="small">
          <Favorite size="large" />
          <Heading size="small" margin="none">
            LifeBank
          </Heading>
        </Box>
      </Header>
      <Page>
        <ChatBot
          botName={"Lifebank_dev"}
          clearOnComplete={false}
          conversationModeOn={false}
          onComplete={handleOnComplete}
          textEnabled={true}
          title={"Lifebank Bot"}
          voiceEnabled={false}
          welcomeMessage={
            "Welcome to Life Bank! Would you like to get started with your blood donation?"
          }
        />
        <a
          href="https://www.messenger.com/t/107322397835861"
          style={{ textDecoration: "none", color: "#333" }}
        >
          {" "}
          <Heading size="small">Chat to us on Facebook Messenger</Heading>
        </a>
      </Page>
    </>
  );
};
