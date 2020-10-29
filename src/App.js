import React from "react";
import { Grommet } from "grommet";
import { theme } from "./theme";

import "./App.css";
import { Chatbot } from "./components/screens/Chatbot/Chatbot";
import { Dashboard } from "./components/screens/Dashboard/Dashboard";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import { ToastProvider } from "react-toast-notifications";
import { Login } from "./components/screens/Login/Login";

export const App = () => {
  return (
    <Grommet full theme={theme}>
      <ToastProvider>
        <Router>
          <Switch>
            <Route path="/login">
              <Login />
            </Route>
            <Route path="/dashboard">
              <Dashboard />
            </Route>
            <Route path="/">
              <Chatbot />
            </Route>
          </Switch>
        </Router>
      </ToastProvider>
    </Grommet>
  );
};
