import { NextResponse } from "next/server";

export type ApiSuccess<T> = {
  ok: true;
  data: T;
  message?: string;
};

export type ApiFailure = {
  ok: false;
  message: string;
  issues?: Record<string, string[]>;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export function apiOk<T>(data: T, message?: string, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>({ ok: true, data, message }, init);
}

export function apiFail(message: string, status = 400, issues?: Record<string, string[]>) {
  return NextResponse.json<ApiFailure>({ ok: false, message, issues }, { status });
}
