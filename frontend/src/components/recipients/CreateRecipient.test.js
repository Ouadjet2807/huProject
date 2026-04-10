import CreateRecipient from "./CreateRecipient";
import { render } from "@testing-library/react";
import { AuthProvider } from "../../context/AuthContext";
import { store } from "../../redux/store";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import { ToastProvider } from "../../context/ToastContext";
import { ConfirmProvider } from "../../context/ConfirmContext";

// test("Check if user can edit", () => {
//   const result = canEdit(3);
//   expect(result).toBe(false);
// });

describe("CreateRecipient", () => {
  delete window.location;
  window.location = {
    reload: jest.fn(),
    href: "http://dummy.com?page=1&name=testing",
  };
  test("Should render without crash", async () => {
    render (
      <Provider store={store}>
        <AuthProvider>
          <ToastProvider>
            <ConfirmProvider>
              <BrowserRouter>
                <CreateRecipient />
              </BrowserRouter>
            </ConfirmProvider>
          </ToastProvider>
        </AuthProvider>
      </Provider>,
    );
  });
});
