// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/vitest";
import {
  ReadableStream,
  WritableStream,
  TransformStream,
} from "web-streams-polyfill";

import { server } from "./mocks/node"
import { TextEncoder, TextDecoder } from "node:util"
import { BroadcastChannel } from "worker_threads"
import { afterAll, afterEach, beforeAll } from "vitest";


Reflect.set(globalThis, "BroadcastChannel", BroadcastChannel);

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};

global.localStorage = localStorageMock;

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder;
}

if (!global.WritableStream) {
  global.WritableStream = WritableStream;
}

if (!globalThis.TransformStream) {
  global.TransformStream = TransformStream;
}

if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder;
}
if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder;
}

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())