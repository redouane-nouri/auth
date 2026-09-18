// The jest.setup.ts file is executed before each test and imports @testing-library/jest-dom that includes a set of convenient custom matchers such as .toBeInTheDocument()
import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "node:util";
/*
  jsdom doesn't provide TextEncoder/TextDecoder globally, but @react-email/render needs them just to be imported.
*/
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;
/*
  jsdom doesn't implement ResizeObserver, or the pointer capture / scrollIntoView APIs, but Radix UI's
  Select needs all of them just to open its dropdown.
*/
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;
Element.prototype.hasPointerCapture = jest.fn();
Element.prototype.releasePointerCapture = jest.fn();
Element.prototype.scrollIntoView = jest.fn();
