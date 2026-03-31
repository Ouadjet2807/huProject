import { canEdit } from "./Space";
import Space from "./Space";
import { render } from "@testing-library/react";
import { AuthProvider } from "../../context/AuthContext";
import { store } from "../../redux/store";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";

test("Check if user can edit", () => {
  const result = canEdit(3);
  expect(result).toBe(false);
});

describe("Space", () => {
  test("Should render without crash", async () => {
    delete window.location;
    window.location = { reload: jest.fn(), href: 'http://dummy.com?page=1&name=testing',};
    render(
      <Provider store={store}>
        <AuthProvider>
          <BrowserRouter>
            <Space />
          </BrowserRouter>
        </AuthProvider>
      </Provider>,
    );
  });
});
