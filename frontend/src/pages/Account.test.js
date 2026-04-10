import Account from "./Account";
import { Provider } from "react-redux";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import { ConfirmProvider } from "../context/ConfirmContext";
import { store } from "../redux/store";
import { BrowserRouter } from "react-router";

describe("Account", () => {
//   const user = {
//     id: "34263dg4-3536w-23665-2455-2426578ewtg34",
//     email: "john.doe@mail.fr",
//     first_name: "John",
//     last_name: "Doe",
//     username: "jDoe1234",
//     invited: {},
//     isAuthenticated: true,
//   };

delete window.location;
window.location = {
  reload: jest.fn(),
  href: "http://dummy.com?page=1&name=testing",
};
  test("Should render without crash", async () => {
    render(
      <Provider store={store}>
        <AuthProvider>
          <ToastProvider>
            <ConfirmProvider>
              <BrowserRouter>
                <Account />
              </BrowserRouter>
            </ConfirmProvider>
          </ToastProvider>
        </AuthProvider>
      </Provider>,
    );

  });
});
