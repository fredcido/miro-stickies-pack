import { createMock } from "@golevelup/ts-jest";
import type {
  BoardViewport,
  Board,
  BoardUI,
  Notifications,
} from "@mirohq/websdk-types";

export function mockMiro() {
  const mockViewport = createMock<BoardViewport>();
  const mockUI = createMock<BoardUI>();
  const mockNotifications = createMock<Notifications>();

  const mockBoard = createMock<Board>({
    viewport: mockViewport,
    ui: mockUI,
    notifications: mockNotifications,
  });

  window.miro = {
    board: mockBoard,
    clientVersion: "test",
  };

  return { mockViewport, mockUI, mockNotifications, mockBoard };
}
