import axios from "axios";

export async function getPiData<T>(url: string): Promise<T> {
  const { data } = await axios.get<T>(url, { timeout: 5000 });
  return data;
}

export async function postPiData<T>(url: string, body?: any): Promise<T> {
  const { data } = await axios.post<T>(url, body ?? {}, { timeout: 5000 });
  return data;
}