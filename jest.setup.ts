// The jest.setup.ts file is executed before each test and imports @testing-library/jest-dom that includes a set of convenient custom matchers such as .toBeInTheDocument()
import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "node:util";
/*
  jsdom (the test environment) doesn't provide TextEncoder/TextDecoder globally, but @react-email/render
  (imported by any route that sends an email) needs them just to be imported, not even called. Node has
  them built in, so just expose Node's own implementation on the global object.
*/
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;
