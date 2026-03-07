import { describe, expect, it } from "bun:test";
import { healthController } from "../health.controller.ts";

describe("healthController", () => {
  it("check returns ok status with ISO timestamp", async () => {
    const response = await healthController.check();

    expect(response.status).toBe(200);
    const payload = (await response.json()) as { status: string; timestamp: string };
    expect(payload.status).toBe("ok");
    expect(typeof payload.timestamp).toBe("string");
    expect(Number.isNaN(Date.parse(payload.timestamp))).toBeFalse();
  });
});
