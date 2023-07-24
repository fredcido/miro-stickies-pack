import { mockMiro } from "./tests/miro";
import { saveConfig, getConfig, defaultConfig, getDefaultValues } from "./pack";

describe("pack", () => {
  const { mockBoard, mockViewport } = mockMiro();

  it("saveConfig", async () => {
    await saveConfig(defaultConfig);
    expect(mockBoard.setAppData).toHaveBeenCalledWith("config", defaultConfig);
  });

  it("getConfig existing", async () => {
    const fakeConfig = { test: "another" };
    mockBoard.getAppData.mockImplementation(() =>
      Promise.resolve({ config: fakeConfig })
    );
    const config = await getConfig();

    expect(mockBoard.getAppData).toHaveBeenCalled();
    expect(config).toMatchObject(fakeConfig);
  });

  it("getConfig default", async () => {
    mockBoard.getAppData.mockImplementation(() => Promise.resolve({}));
    const config = await getConfig();

    expect(mockBoard.getAppData).toHaveBeenCalled();
    expect(config).toMatchObject(defaultConfig);
  });

  describe("getDefaultValues", () => {
    it("default to viewport", async () => {
      const viewport = {
        x: 800,
        y: -250,
        width: 1200,
        height: 600,
      };

      mockBoard.getSelection.mockImplementation(() => Promise.resolve([]));
      mockViewport.get.mockImplementation(() => Promise.resolve(viewport));

      const values = await getDefaultValues();

      expect(mockBoard.getSelection).toHaveBeenCalled();
      expect(mockViewport.get).toHaveBeenCalled();

      expect(values).toMatchObject({
        width: 200,
        height: 200,
        x: viewport.x + viewport.width / 2,
        y: viewport.y + viewport.height / 2,
      });
    });
  });
});
