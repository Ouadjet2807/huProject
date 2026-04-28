import Navbar from "./Navbar";
import { Provider } from "react-redux";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import { ConfirmProvider } from "../context/ConfirmContext";
import { store } from "../redux/store";
import { BrowserRouter } from "react-router";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { UseDimensionProvider } from "../context/UseDimensionsContext";

const ProviderWrapper = ({ children }) => (
  <Provider store={store}>
    <UseDimensionProvider>
      <AuthProvider>
        <ToastProvider>
          <ConfirmProvider>
            <BrowserRouter>{children}</BrowserRouter>
          </ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
    </UseDimensionProvider>
  </Provider>
);

describe("Navbar", () => {
  delete window.location;
  window.location = {
    reload: vi.fn(),
    href: "http://dummy.com?page=1&name=testing",
  };
  it("Should render without crash", async () => {
    render(<Navbar notifications={[]} />, { wrapper: ProviderWrapper });

    const navigation = screen.getByTestId("navigation");
    expect(navigation).toBeInTheDocument();
  });
  it("Should display nav item labels when user hover over the navbar", async () => {
    await act(async () => {
      render(<Navbar notifications={[]} />, { wrapper: ProviderWrapper });
    });

    const navigation = screen.getByTestId("navigation");

    await userEvent.hover(navigation);

    const navItemsText = screen.queryAllByTestId("navItemText");

    navItemsText.forEach((navItem) => {
      expect(navItem).toBeInTheDocument();
    });
  });
  it("Should hide nav item labels when user unhover over the navbar", async () => {
    await act(async () => {
      render(<Navbar notifications={[]} />, { wrapper: ProviderWrapper });
    });

    const navigation = screen.getByTestId("navigation");

    await userEvent.hover(navigation);

    await userEvent.unhover(navigation);

    const navItemsText = screen.queryAllByTestId("navItemText");

    navItemsText.forEach((navItem) => {
      expect(navItem).not.toBeInTheDocument();
    });
  });
  it("Should make navbar stick when user click on the pin icon", async () => {
    await act(async () => {
      render(
        <Navbar
          notifications={[]}
          user={{ id: 1, first_name: "John", last_name: "Doe" }}
        />,
        { wrapper: ProviderWrapper },
      );
    });

    const navigation = await screen.findByTestId("navigation");
    const navPin = await screen.findByTestId("navPin");

    await userEvent.hover(navigation);

    await new Promise((p) => setTimeout(p, 1000));

    expect(navPin).toBeInTheDocument();

    await userEvent.click(navPin);
    await userEvent.unhover(navigation);

    const navItemsText = screen.queryAllByTestId("navItemText");

    navItemsText.forEach((navItem) => {
      expect(navItem).toBeInTheDocument();
    });
  });
  it("Should make navbar unstick when user click on the pin icon", async () => {
    await act(async () => {
      render(
        <Navbar
          notifications={[]}
          user={{ id: 1, first_name: "John", last_name: "Doe" }}
        />,
        { wrapper: ProviderWrapper },
      );
    });

    const navigation = await screen.findByTestId("navigation");
    const navPin = await screen.findByTestId("navPin");

    await userEvent.hover(navigation);

    expect(navPin).toBeInTheDocument();

    await userEvent.click(navPin);
    await userEvent.click(navPin);
    await userEvent.unhover(navigation);

    const navItemsText = screen.queryAllByTestId("navItemText");

    navItemsText.forEach((navItem) => {
      expect(navItem).not.toBeInTheDocument();
    });
  });
  it("Should display unread notifications number pill when notifications array is provided", async () => {
    await act(async () => {
      render(
        <Navbar
          notifications={[
            { id: 1, title: "Notification 1", is_read: false },
            { id: 2, title: "Notification 2", is_read: true },
            { id: 3, title: "Notification 3", is_read: false },
          ]}
          user={{ id: 1, first_name: "John", last_name: "Doe" }}
        />,
        { wrapper: ProviderWrapper },
      );
    });

    const notificationsPill = await screen.findByTestId("notificationsPill");

    expect(notificationsPill).toBeInTheDocument();
    expect(notificationsPill).toHaveTextContent("2");
  });
  it("Should not display unread notifications number pill when notifications array is empty", async () => {
    await act(async () => {
      render(
        <Navbar
          notifications={[]}
          user={{ id: 1, first_name: "John", last_name: "Doe" }}
        />,
        { wrapper: ProviderWrapper },
      );
    });

    const notificationsPill = screen.queryByTestId("notificationsPill");

    expect(notificationsPill).not.toBeInTheDocument();
  });
  it("Should update unread notification number when user click on a notification", async () => {
    await act(async () => {
      render(
        <Navbar
          user={{ id: 1, first_name: "John", last_name: "Doe" }}
          notifications={[
            {
              id: 1,
              title: "Notification 1",
              is_read: false,
              message: "Un traitement a expiré",
            },
            {
              id: 2,
              title: "Notification 2",
              is_read: false,
              message: "Rappel de votre événement dans 15 minute(s)",
            },
          ]}
        />,
        { wrapper: ProviderWrapper },
      );
    });
    const showNotificationsButton = await screen.findByTestId(
      "showNotificationsButton",
    );
    await userEvent.click(showNotificationsButton);
    const notificationItems = await screen.findAllByTestId("notificationItem");

    await userEvent.click(notificationItems[0]);

    const notificationsPill = await screen.findByTestId("notificationsPill");
    const heading = await screen.findByRole("heading", { level: 4 });

    expect(heading).toHaveTextContent(/(1)/i);
    expect(notificationsPill).toHaveTextContent(/(1)/i);
  });
  it("Should hide notifications number pill when all notification are read after update", async () => {
    await act(async () => {
      render(
        <Navbar
          user={{ id: 1, first_name: "John", last_name: "Doe" }}
          notifications={[
            {
              id: 1,
              title: "Notification 1",
              is_read: false,
              message: "Un traitement a expiré",
            },
            {
              id: 2,
              title: "Notification 2",
              is_read: true,
              message: "Rappel de votre événement dans 15 minute(s)",
            },
          ]}
        />,
        { wrapper: ProviderWrapper },
      );
    });
    const showNotificationsButton = await screen.findByTestId(
      "showNotificationsButton",
    );
    await userEvent.click(showNotificationsButton);
    const notificationItems = await screen.findAllByTestId("notificationItem");

    await userEvent.click(notificationItems[0]);

    const notificationsPill = screen.queryByTestId("notificationsPill");

    expect(notificationsPill).not.toBeInTheDocument();
  });
});
