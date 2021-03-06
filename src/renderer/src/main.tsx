import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./store";
import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { HashRouter } from "react-router-dom";
import { theme } from "./theme";
import { GlobalStyleOverride } from "./globalStyles";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <HashRouter>
            <GlobalStyleOverride />
            <App />
          </HashRouter>
        </ThemeProvider>
      </StyledEngineProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
