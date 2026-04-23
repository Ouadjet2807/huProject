import Notifications from "./Notifications";
import { Provider } from "react-redux";
import { render, screen } from "@testing-library/react";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import { ConfirmProvider } from "../context/ConfirmContext";
import { store } from "../redux/store";
import { BrowserRouter } from "react-router";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

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

describe("Notifications", () => {
  delete window.location;
  window.location = {
    reload: vi.fn(),
    href: "http://dummy.com?page=1&name=testing",
  };
  it("Should render without crash", async () => {
    render(<Notifications notifications={[]} />, { wrapper: ProviderWrapper });

    const heading = screen.getByRole("heading", { level: 4 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/notifications/i);
  });
  it("Should display unread notifications number when notifications array and unread notifications number are provided", async () => {
    render(
      <Notifications
        notifications={[
          { id: 1, title: "Notification 1", is_read: false },
          { id: 2, title: "Notification 2", is_read: true },
          { id: 3, title: "Notification 3", is_read: false },
        ]}
        notificationsNotRead={2}
      />,
      { wrapper: ProviderWrapper },
    );

    const heading = screen.getByRole("heading", { level: 4 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/(2)/i);
  });
  it("Should display notifications timestamp", async () => {
    render(
      <Notifications
        notifications={[
          {
            id: 1,
            title: "Notification 1",
            is_read: false,
            timestamp: "2026-03-18T21:09:01.351653Z",
          },
        ]}
        notificationsNotRead={2}
      />,
      { wrapper: ProviderWrapper },
    );

    const time = screen.getByTestId("time");
    expect(time).toBeInTheDocument();
    expect(time).toHaveTextContent(
      new Date("2026-03-18T21:09:01.351653Z").toLocaleDateString(),
    );
  });
  it("Should truncate notifications title if it's longer than 25v char", async () => {
    const limit = 25;
    const title = "a".repeat(30);

    render(
      <Notifications
        notifications={[
          {
            id: 1,
            title: title,
            is_read: false,
            timestamp: "2026-03-18T21:09:01.351653Z",
          },
        ]}
      />,
      { wrapper: ProviderWrapper },
    );

    const truncatedTitle = title.substring(0, limit) + "...";
    expect(screen.getByText(truncatedTitle)).toBeInTheDocument();
  });
  it("Should render correct icon", async () => {
    const notifications = [
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
    ];

    render(<Notifications notifications={notifications} />, {
      wrapper: ProviderWrapper,
    });

    const pillIcon = screen.getByTestId("pillIcon");
    const calendarIcon = screen.getByTestId("calendarIcon");

    notifications.forEach((notification, index) => {
      if (/s*(traitement)/g.test(notification.message)) {
        expect(pillIcon).toBeInTheDocument();
      } else if (/s*(événement)/g.test(notification.message)) {
        expect(calendarIcon).toBeInTheDocument();
      }
    });
  });
});
