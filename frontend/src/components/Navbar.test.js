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

const ProviderWrapper = ({ children }) => (
  <Provider store={store}>
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  </Provider>
);

describe("Navbar", () => {
  delete window.location;
  window.location = {
    reload: jest.fn(),
    href: "http://dummy.com?page=1&name=testing",
  };
  it("Should render without crash", async () => {
    render(<Navbar notifications={[]} />, { wrapper: ProviderWrapper });

    const navigation = screen.getByTestId("navigation");
    expect(navigation).toBeInTheDocument();
  });
  it("Should display nav item labels when user hover over the navbar", async () => {
    render(<Navbar notifications={[]} />, { wrapper: ProviderWrapper });

    const navigation = screen.getByTestId("navigation");

    await userEvent.hover(navigation);

    const navItemsText = screen.queryAllByTestId("navItemText");

    navItemsText.forEach((navItem) => {
      expect(navItem).toBeInTheDocument();
    });
  });
  it("Should hide nav item labels when user unhover over the navbar", async () => {
    render(<Navbar notifications={[]} />, { wrapper: ProviderWrapper });

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

    const navigation = screen.getByTestId("navigation");
    const navPin = screen.getByTestId("navPin");

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

    const navigation = screen.getByTestId("navigation");
    const navPin = screen.getByTestId("navPin");

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

    const notificationsPill = screen.getByTestId("notificationsPill");

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
  it("Should display notifications list when user click on notifications nav item", async () => {
    await act(async () => {
      render(
        <Navbar
          notifications={[]}
          user={{ id: 1, first_name: "John", last_name: "Doe" }}
        />,
        { wrapper: ProviderWrapper },
      );
    });

    const showNotificationsButton = screen.getByTestId(
      "showNotificationsButton",
    );
    expect(showNotificationsButton).toBeInTheDocument();

    await userEvent.click(showNotificationsButton);
    const notificationsComponent = screen.queryByTestId(
      "notificationsComponent",
    );

    expect(notificationsComponent).toBeInTheDocument();
  });
  it("Should hide notifications list when user click on notifications close button", async () => {
    await act(async () => {
      render(
        <Navbar
          notifications={[]}
          user={{ id: 1, first_name: "John", last_name: "Doe" }}
        />,
        { wrapper: ProviderWrapper },
      );
    });

    const showNotificationsButton = screen.getByTestId(
      "showNotificationsButton",
    );

    await userEvent.click(showNotificationsButton);
    const hideNotificationsButton = screen.queryByTestId(
      "hideNotificationsButton",
    );
    expect(hideNotificationsButton).toBeInTheDocument();

    await userEvent.click(hideNotificationsButton);

    const notificationsComponent = screen.queryByTestId(
      "notificationsComponent",
    );
    expect(notificationsComponent).not.toBeInTheDocument();
  });
  it("Should update unread notification number when user click on a notification", async () => {
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
    const showNotificationsButton = screen.getByTestId(
      "showNotificationsButton",
    );
    await userEvent.click(showNotificationsButton);
    const notificationItems = screen.getAllByTestId("notificationItem");

    await userEvent.click(notificationItems[0]);

    const notificationsPill = screen.getByTestId("notificationsPill");
    const heading = screen.getByRole("heading", { level: 4 });

    expect(heading).toHaveTextContent(/(1)/i);
    expect(notificationsPill).toHaveTextContent(/(1)/i);
  });
  it("Should hide notifications number pill when all notification are read after update", async () => {
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
    const showNotificationsButton = screen.getByTestId(
      "showNotificationsButton",
    );
    await userEvent.click(showNotificationsButton);
    const notificationItems = screen.getAllByTestId("notificationItem");

    await userEvent.click(notificationItems[0]);

    const notificationsPill = screen.queryByTestId("notificationsPill");

    expect(notificationsPill).not.toBeInTheDocument();
  });
});
