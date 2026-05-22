import { describe, expect, it } from "vitest";
import { createUserSchema } from "./user";

describe("createUserSchema", () => {
  it("validates required user fields", () => {
    const parsed = createUserSchema.safeParse({
      name: "Admin",
      email: "admin@example.com",
      password: "secret123",
      role: "admin",
      employeeCode: "ADM-001",
    });

    expect(parsed.success).toBe(true);
  });
});
