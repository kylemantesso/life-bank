import React, { useEffect, useState } from "react";
import {
  Heading,
  Button,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  Tabs,
  Box,
  Text,
  Header,
} from "grommet";
import { API } from "aws-amplify";
import TimeAgo from "react-timeago";
import { Spinner } from "../../Spinner/Spinner";
import { Page } from "../../Page/Page";
import { useToasts } from "react-toast-notifications";
import { Favorite } from "grommet-icons";

function download(dataurl, filename) {
  var a = document.createElement("a");
  a.href = dataurl;
  a.setAttribute("download", filename);
  a.click();
}

const SubmissionTable = ({ submissions, reload, setReload, doctor }) => {
  const { addToast } = useToasts();

  return (
    <Table margin={{ top: "large" }} style={{ width: "100%" }}>
      <TableHeader>
        <TableRow>
          <TableCell scope="col" border="bottom">
            Donor Name
          </TableCell>
          {doctor ? (
            <TableCell scope="col" border="bottom">
              Donor Name
            </TableCell>
          ) : null}
          <TableCell scope="col" border="bottom">
            Submitted
          </TableCell>
          <TableCell scope="col" border="bottom" />
        </TableRow>
      </TableHeader>
      <TableBody>
        <>
          {submissions.map((submission) => (
            <TableRow key={submission.id}>
              <TableCell>{submission.name}</TableCell>
              {doctor ? <TableCell>{submission.doctorName}</TableCell> : null}

              <TableCell>
                <TimeAgo date={submission.submitted} />
              </TableCell>
              <TableCell>
                {submission.submissionStatus === "submitted" ? (
                  <Button
                    label="Send for signing"
                    onClick={() => {
                      // TODO: Make dynamic
                      API.post("submissionApi", "/submission/send", {
                        body: {
                          submission,
                          doctorName: "Dr Teresa Miller",
                          doctorEmail: "kylemantesso+doctor@gmail.com",
                          id: submission.id,
                        },
                      }).then((res) => {
                        setReload(reload + 1);
                        addToast("Agreement sent for signing", {
                          appearance: "success",
                          autoDismiss: true,
                        });
                        console.log(res);
                      });
                    }}
                  />
                ) : submission.submissionStatus === "complete" &&
                  submission.agreementId ? (
                  <Button
                    label="Download"
                    onClick={async () => {
                      const { url } = await API.get(
                        "submissionApi",
                        "/submission/download?id=" + submission.agreementId
                      );
                      download(url, "donor-questionnaire.pdf");
                    }}
                  />
                ) : (
                  ""
                )}
              </TableCell>
            </TableRow>
          ))}
        </>
      </TableBody>
    </Table>
  );
};

export const Dashboard = () => {
  const [reload, setReload] = useState(0);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("submissionApi", "/submission")
      .then((res) => {
        console.log(res);
        setSubmissions(res);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, [reload]);

  return (
    <>
      <Header background="brand" pad="medium">
        <Box direction="row" align="center" gap="small">
          <Favorite size="large" />
          <Heading size="small" margin="none">
            LifeBank
          </Heading>
        </Box>
          <Box direction="row" align="center" gap="medium">
            <Text>Dr Teresa Miller</Text>
            <img src="profile.png" height="48" />
          </Box>
      </Header>
      <Page>
        <Heading>Dashboard</Heading>
        {loading ? (
          <Spinner />
        ) : (
          <Tabs alignControls={"start"}>
            <Tab title="Submitted">
              <SubmissionTable
                reload={reload}
                doctor={false}
                setReload={setReload}
                submissions={submissions.filter(
                  (submission) => submission.submissionStatus === "submitted"
                )}
              />
            </Tab>
            <Tab title="Sent">
              <SubmissionTable
                doctor={true}
                submissions={submissions.filter(
                  (submission) => submission.submissionStatus === "sent"
                )}
              />
            </Tab>
            <Tab title="Complete">
              <SubmissionTable
                doctor={true}
                submissions={submissions.filter(
                  (submission) => submission.submissionStatus === "complete"
                )}
              />
            </Tab>
          </Tabs>
        )}
      </Page>
    </>
  );
};
