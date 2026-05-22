import { describe, expect, it } from "vitest";
import { runKMeans } from "./kmeans";

describe("runKMeans", () => {
  it("returns discipline labels for attendance patterns", () => {
    const result = runKMeans(
      [
        { userId: "1", name: "A", metrics: { hadir: 10, terlambat: 0, izin: 0, sakit: 0, cuti: 0, alfa: 0 } },
        { userId: "2", name: "B", metrics: { hadir: 3, terlambat: 4, izin: 1, sakit: 0, cuti: 0, alfa: 2 } },
      ],
      2,
    );

    expect(result.assignments).toHaveLength(2);
    expect(result.assignments.map((item) => item.label)).toContain("Disiplin Tinggi");
  });
});
