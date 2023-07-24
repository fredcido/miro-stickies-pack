import { mockMiro } from "./tests/miro";
import { Event } from "./analytics";
import { init } from "./init";

describe("init", () => {
  const track = jest.fn();
  const getReferenceItem = jest.fn();
  const createPack = jest.fn();
  const initOpts = { track, getReferenceItem, createPack };
  const { mockUI } = mockMiro();

  it("track init", () => {
    init(initOpts);
    expect(track).toHaveBeenCalledWith(Event.PAGE_LOAD, { page: "index" });
  });

  it("icon:click", (done) => {
    const mockOn = mockUI.on as unknown as jest.MockedFunction<
      (event: "icon:click", handler: () => void) => void
    >;

    const event = "icon:click";
    mockOn.mockImplementation((e, handler) => {
      if (event == e) {
        handler();

        expect(track).toHaveBeenCalledWith(Event.ICON_CLICK);
        expect(mockUI.openPanel).toHaveBeenCalledWith({
          url: "app.html",
          height: 560,
        });

        done();
      }
    });

    init(initOpts);

    expect(mockUI.on).toHaveBeenCalledWith(event, expect.any(Function));
  });

  it("custom:open-settings", (done) => {
    const event = "custom:open-settings";
    mockUI.on.mockImplementation((e, handler) => {
      if (event == e) {
        handler({ items: [] });

        expect(track).toHaveBeenCalledWith(Event.CUSTOM_ACTON, {
          action: "open-settings",
        });
        expect(mockUI.openPanel).toHaveBeenCalledWith({
          url: "app.html",
          height: 560,
        });

        done();
      }
    });

    init(initOpts);

    expect(mockUI.on).toHaveBeenCalledWith(event, expect.any(Function));
  });

  it("custom:create-pack", (done) => {
    const event = "custom:create-pack";
    mockUI.on.mockImplementation((e, handler) => {
      if (e == event) {
        handler({
          items: [],
        });

        expect(track).toHaveBeenCalledWith(Event.CUSTOM_ACTON, {
          action: "create-pack",
        });

        done();
      }
    });

    init(initOpts);

    expect(mockUI.on).toHaveBeenCalledWith(event, expect.any(Function));
  });
});
