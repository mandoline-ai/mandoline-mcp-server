import { afterAll, beforeAll, jest } from "@jest/globals";

beforeAll(() => {
  process.env.NODE_ENV = "test";
  process.env.MANDOLINE_API_BASE_URL = "https://api.example.com";

  if (!process.env.DEBUG_TESTS) {
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "info").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
  }
});

afterAll(() => {
  jest.restoreAllMocks();
});
