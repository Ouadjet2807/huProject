import Toast from "./Toast";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import { ConfirmProvider } from "../context/ConfirmContext";
import { store } from "../redux/store";
import { BrowserRouter } from "react-router";

describe("Toast", () => {
  test("Should render without crash", async () => {
    delete window.location;
    window.location = {
      reload: jest.fn(),
      href: "http://dummy.com?page=1&name=testing",
    };
    render (
      <Provider store={store}>
        <AuthProvider>
          <ToastProvider>
            <ConfirmProvider>
              <BrowserRouter>
                <Toast message=""/>
              </BrowserRouter>
            </ConfirmProvider>
          </ToastProvider>
        </AuthProvider>
      </Provider>,
    );
  });
});
