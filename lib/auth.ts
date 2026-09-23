import { api } from "./api";

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  username: string;
  firstName: string;
  lastName: string;
  image: string;
};

export async function login(username: string, password: string) {
  const { data } = await api.post<LoginResponse>("/auth/login", {
    username,
    password,
    expiresInMins: 60,
  });
  return data;
}

export function saveSession(data: LoginResponse) {
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  localStorage.setItem(
    "user",
    JSON.stringify({
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      image: data.image,
    }),
  );
}

export function clearSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

export function isAuthenticated() {
  return typeof window !== "undefined" && Boolean(localStorage.getItem("accessToken"));
}
