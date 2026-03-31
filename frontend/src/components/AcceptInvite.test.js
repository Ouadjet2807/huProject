import { Provider } from "react-redux";
import AcceptInvite from "./AcceptInvite";
import { render } from "@testing-library/react";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import { ConfirmProvider } from "../context/ConfirmContext";
import { store } from "../redux/store";
import { BrowserRouter } from "react-router";



describe("AcceptInvite", () => {
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
                <AcceptInvite />
              </BrowserRouter>
            </ConfirmProvider>
          </ToastProvider>
        </AuthProvider>
      </Provider>,
    );
  });
});
