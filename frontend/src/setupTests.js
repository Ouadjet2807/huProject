// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import {
  ReadableStream,
  WritableStream,
  TransformStream,
} from "web-streams-polyfill";
import { beforeAll, afterEach, afterAll } from 'jest'
import { server } from "./mocks/node"
import { TextEncoder, TextDecoder } from "node:util"
import { BroadcastChannel } from "worker_threads"


Reflect.set(globalThis, "BroadcastChannel", BroadcastChannel);

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
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