import {http, HttpResponse} from 'msw';
import {setupServer} from 'msw/node';
import { canEdit } from "./Space";
import Space from "./Space";
import { render, waitFor, screen } from "@testing-library/react";
import { AuthProvider } from "../../context/AuthContext";
import { store } from "../../redux/store";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";


const spaceMockedData = [
    {
      agenda: {id: 'e7da88b9-2829-4942-8c57-fd8e5f3637f1', space: '147447e9-53a2-4fd6-8fd3-6bf5bf159910', items: Array(32), categories: Array(6)},
      caregivers: [1, 3],
      created_at: "2025-11-17T12:43:20.468330Z",
      created_by: {id: '03601ebf-d5cc-4c45-9f46-d823375e712e', username: 'ouadjet2807', last_name: 'Socrate', first_name: 'Nina', email: 'n.socrat@outlook.fr'},
      description: "Personal space created automatically",
      id: "147447e9-53a2-4fd6-8fd3-6bf5bf159910",
      name: "Test's Space",
      recipients: [2, 5],
      todos: {id: '25e5a0aa-19cd-4201-a0f0-26c6380ffb2c', space: '147447e9-53a2-4fd6-8fd3-6bf5bf159910', items: Array(4)},
      updated_at: "2025-12-14T14:14:40.308443Z",
    },
]

const server = setupServer(
  http.get('http://127.0.0.1:8000/api/space_memberships/', () => {
    console.log(HttpResponse.json({space: spaceMockedData}));
    return HttpResponse.json()
  }),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())


test("Check if user can edit", () => {
  const result = canEdit(3);
  expect(result).toBe(false);
});

describe("Space", () => {
  delete window.location;
  window.location = { reload: jest.fn(), href: 'http://dummy.com?page=1&name=testing',};
  test("Should render without crash", async () => {
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
