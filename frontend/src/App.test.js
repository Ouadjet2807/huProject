import { render, screen } from "@testing-library/react";
import App from "./App";
import { Provider } from "react-redux";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import { store } from "./redux/store";
import { ConfirmProvider } from "./context/ConfirmContext";
import { act } from "react";

describe("App", () => {


  it("Should render App", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <ToastProvider>
            <AuthProvider>
              <ConfirmProvider>
                <App />
              </ConfirmProvider>
            </AuthProvider>
          </ToastProvider>
        </Provider>,
      );
    });
  });
});
