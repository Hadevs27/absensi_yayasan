import type { ClusterMetrics } from "@/db/schema";

export type KMeansPoint = {
  userId: string;
  name: string;
  metrics: ClusterMetrics;
};

export type KMeansAssignment = KMeansPoint & {
  clusterIndex: number;
  label: string;
};

type Vector = [number, number, number, number, number, number];

function toVector(point: KMeansPoint): Vector {
  const { metrics } = point;
  return [
    metrics.hadir,
    metrics.terlambat,
    metrics.izin,
    metrics.sakit,
    metrics.cuti,
    metrics.alfa,
  ];
}

function distance(a: Vector, b: Vector) {
  return Math.sqrt(a.reduce((total, value, index) => total + (value - b[index]) ** 2, 0));
}

function mean(vectors: Vector[]): Vector {
  if (vectors.length === 0) {
    return [0, 0, 0, 0, 0, 0];
  }

  const totals = vectors.reduce<Vector>(
    (acc, vector) => vector.map((value, index) => acc[index] + value) as Vector,
    [0, 0, 0, 0, 0, 0],
  );

  return totals.map((value) => value / vectors.length) as Vector;
}

function labelCentroid(centroid: Vector) {
  const [hadir, terlambat, izin, sakit, cuti, alfa] = centroid;
  const nonActive = izin + sakit + cuti + alfa;

  if (hadir >= terlambat + nonActive && terlambat <= 1 && alfa <= 1) {
    return "Rajin";
  }

  if (terlambat >= hadir * 0.35 && terlambat >= alfa) {
    return "Sering Terlambat";
  }

  if (alfa + nonActive >= hadir * 0.5) {
    return "Butuh Perhatian";
  }

  return "Cukup Stabil";
}

function silhouetteScore(vectors: Vector[], assignments: number[], k: number) {
  if (vectors.length <= 1 || k <= 1) {
    return null;
  }

  const scores = vectors.map((vector, index) => {
    const ownCluster = assignments[index];
    const sameCluster = vectors.filter((_, otherIndex) => assignments[otherIndex] === ownCluster);
    const otherClusters = Array.from({ length: k }, (_, clusterIndex) => clusterIndex).filter(
      (clusterIndex) => clusterIndex !== ownCluster,
    );

    const a =
      sameCluster.length <= 1
        ? 0
        : sameCluster.reduce((total, other) => total + distance(vector, other), 0) /
          (sameCluster.length - 1);

    const b = Math.min(
      ...otherClusters.map((clusterIndex) => {
        const clusterVectors = vectors.filter((_, otherIndex) => assignments[otherIndex] === clusterIndex);
        if (clusterVectors.length === 0) {
          return Number.POSITIVE_INFINITY;
        }

        return (
          clusterVectors.reduce((total, other) => total + distance(vector, other), 0) /
          clusterVectors.length
        );
      }),
    );

    if (!Number.isFinite(b) || Math.max(a, b) === 0) {
      return 0;
    }

    return (b - a) / Math.max(a, b);
  });

  return scores.reduce((total, score) => total + score, 0) / scores.length;
}

export function runKMeans(points: KMeansPoint[], requestedK: number) {
  if (points.length === 0) {
    return { assignments: [] as KMeansAssignment[], silhouetteScore: null };
  }

  const k = Math.min(Math.max(requestedK, 1), points.length);
  const vectors = points.map(toVector);
  let centroids = vectors.slice(0, k);
  let assignments = new Array<number>(points.length).fill(0);

  for (let iteration = 0; iteration < 30; iteration += 1) {
    const nextAssignments = vectors.map((vector) => {
      const distances = centroids.map((centroid) => distance(vector, centroid));
      return distances.indexOf(Math.min(...distances));
    });

    const changed = nextAssignments.some((clusterIndex, index) => clusterIndex !== assignments[index]);
    assignments = nextAssignments;

    centroids = centroids.map((_, clusterIndex) =>
      mean(vectors.filter((__, index) => assignments[index] === clusterIndex)),
    );

    if (!changed) {
      break;
    }
  }

  const labels = centroids.map(labelCentroid);

  return {
    assignments: points.map((point, index) => ({
      ...point,
      clusterIndex: assignments[index],
      label: labels[assignments[index]],
    })),
    silhouetteScore: silhouetteScore(vectors, assignments, k),
  };
}
