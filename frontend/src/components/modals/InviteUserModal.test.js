import InviteUserModal from "./InviteUserModal";
import { render } from "@testing-library/react";
import { AuthProvider } from "../../context/AuthContext";
import { store } from "../../redux/store";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import { ToastProvider } from "../../context/ToastContext";
import { ConfirmProvider } from "../../context/ConfirmContext";


describe("CreateRecipient", () => {
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
                <InviteUserModal />
              </BrowserRouter>
            </ConfirmProvider>
          </ToastProvider>
        </AuthProvider>
      </Provider>,
    );
  });
});
