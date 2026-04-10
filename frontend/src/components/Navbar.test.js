import Navbar from "./Navbar";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import { ConfirmProvider } from "../context/ConfirmContext";
import { store } from "../redux/store";
import { BrowserRouter } from "react-router";



describe("Navbar", () => {
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
                <Navbar notifications={[]}/>
              </BrowserRouter>
            </ConfirmProvider>
          </ToastProvider>
        </AuthProvider>
      </Provider>,
    );
  });
});
