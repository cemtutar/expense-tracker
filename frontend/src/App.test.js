import { render, screen } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: async () => [],
    })
  );
});

afterEach(() => {
  jest.resetAllMocks();
});

test("renders expense tracker header", async () => {
  render(<App />);
  expect(await screen.findByRole("heading", { name: /expense tracker/i })).toBeInTheDocument();
});
