import Profile from "./Profile";
import { render } from "@testing-library/react";
import { AuthProvider } from "../../context/AuthContext";
import { store } from "../../redux/store";
import { Provider } from "react-redux";
import { ToastProvider } from "../../context/ToastContext";
import { BrowserRouter } from "react-router";

// test("Check if user can edit", () => {
//   const result = canEdit(3);
//   expect(result).toBe(false);
// });

describe("Profile", () => {
  test("Should render without crash", async () => {
    delete window.location;
    window.location = {
      reload: jest.fn(),
      href: "http://dummy.com?page=1&name=testing",
    };
    render(
      <Provider store={store}>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <Profile
                editMode={{ active: false, target: "" }}
                roles={[
                  [1, "administrateur"],
                  [2, "éditeur"],
                  [3, "lecteur"],
                ]}
              />
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </Provider>,
    );
  });
});
