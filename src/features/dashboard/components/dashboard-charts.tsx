"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AttendanceTrendPoint, ClusterSummaryPoint } from "../services/dashboard-service";

export function DashboardCharts({
  trend,
  clusterSummary,
}: {
  trend: AttendanceTrendPoint[];
  clusterSummary: ClusterSummaryPoint[];
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
      <section className="rounded-lg border border-stone-200 bg-white p-4">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-stone-950">Tren absensi 30 hari</h2>
          <p className="text-sm text-stone-500">Perbandingan hadir, terlambat, izin, dan alfa.</p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#78716c" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#78716c" />
              <Tooltip />
              <Area dataKey="hadir" name="Hadir" stackId="1" stroke="#047857" fill="#a7f3d0" />
              <Area dataKey="terlambat" name="Terlambat" stackId="1" stroke="#b45309" fill="#fde68a" />
              <Area dataKey="izin" name="Izin/Sakit" stackId="1" stroke="#0369a1" fill="#bae6fd" />
              <Area dataKey="alfa" name="Alfa" stackId="1" stroke="#be123c" fill="#fecdd3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-4">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-stone-950">Ringkasan cluster</h2>
          <p className="text-sm text-stone-500">Distribusi kedisiplinan siswa terbaru.</p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={clusterSummary}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#78716c" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#78716c" />
              <Tooltip />
              <Bar dataKey="total" name="Siswa" fill="#047857" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
