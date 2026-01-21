vi.mock("chalk", () => {
  return {
    default: {
      red: vi.fn((str: string) => str),
      green: vi.fn((str: string) => str),
      yellow: vi.fn((str: string) => str),
      blue: vi.fn((str: string) => str),
      cyanBright: vi.fn((str: string) => str),
      black: vi.fn((str: string) => str),
    },
  };
});
