import jwt from "jwt-decode";

export default class AuthUtils {
  static async login(username: string, password: string) {
    const response = await fetch("api/auth/Login", {
      method: "POST",
      body: JSON.stringify({
        username: username,
        password: password
      }),
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) return false;

    const data = await response.json();
    this.saveTokens(data);

    return true;
  }

  static async loginReadonly(password: string) {
    const response = await fetch("api/auth/LoginReadonly", {
      method: "POST",
      body: JSON.stringify({
        password: password
      }),
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) return false;

    const data = await response.json();
    this.saveTokens(data);

    return true;
  }

  static async logout() {
    const response = await fetch("api/auth/Logout", {
      method: "POST",
      body: JSON.stringify({
        Token: localStorage.getItem("todd-refresh")
      })
    })

    return response.ok;
  }

  static saveTokens(tokens: TokenPair) {
    localStorage.setItem("todd-access", tokens.access);

    if (tokens.refresh) {
      localStorage.setItem("todd-refresh", tokens.refresh);
    }

    const jwtPayload: any = jwt(tokens.access);
    localStorage.setItem("todd-role", jwtPayload.role ?? "readonly");
  }
}

interface TokenPair {
  access: string;
  refresh?: string;
}