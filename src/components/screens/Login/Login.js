import React, { useState } from "react";
import {
  Heading,
  Button,
  FormField,
  TextInput,
  Box,
  Header,
} from "grommet";
import { Favorite } from "grommet-icons";

import { Page } from "../../Page/Page";
import { useHistory } from "react-router-dom";

//TODO: Implement login
export const Login = () => {
  let history = useHistory();

  const [username, setUsername] = useState();
  const [password, setPassword] = useState();

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
        <Box>
          <Heading>Login</Heading>
          <FormField label="Email">
            <TextInput
              onChange={(event) => setUsername(event.target.value)}
              value={username}
            />
          </FormField>
          <FormField label="Password">
            <TextInput
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
            />
          </FormField>
          <Button
            primary
            disabled={!username || !password}
            label="Login"
            onClick={() => {
              history.push("/dashboard");
            }}
          />
        </Box>
      </Page>
    </>
  );
};
