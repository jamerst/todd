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

  static async refresh() {
    if (!this.getRefresh()) return false;

    const response = await fetch("api/auth/Refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        access: this.getAccess(),
        refresh: this.getRefresh()
      })
    });

    if (!response.ok) return false;

    const data = await response.json();
    this.saveTokens(data);
    return true;
  }

  static async logout() {
    const response = await this.authFetch("api/auth/Logout", {
      method: "POST",
      body: JSON.stringify({
        Token: localStorage.getItem("todd-refresh")
      }),
      headers: {
        "Content-Type": "application/json"
      }
    });

    localStorage.removeItem("todd-access");
    localStorage.removeItem("todd-refresh");
    localStorage.removeItem("todd-access-expiry");
    localStorage.removeItem("todd-role");

    return response.ok;
  }

  static async authFetch(url: string, options?: RequestInit): Promise<Response> {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        ...{ "Authorization": `Bearer ${this.getAccess()}` }
      }
    });

    if (response.status === 401) {
      if (this.getRefresh() && this.refresh()) {
        return await this.authFetch(url, options);
      } else {
        return response;
      }
    } else {
      return response;
    }
  }

  static saveTokens(tokens: TokenPair) {
    localStorage.setItem("todd-access", tokens.access);

    if (tokens.refresh) {
      localStorage.setItem("todd-refresh", tokens.refresh);
    }

    const jwtPayload: any = jwt(tokens.access);
    localStorage.setItem("todd-role", jwtPayload.role ?? "readonly");
    localStorage.setItem("todd-access-expiry", jwtPayload.exp);
  }

  static isLoggedIn() {
    return localStorage.getItem("todd-access") !== null || (
        parseInt(localStorage.getItem("todd-access-expiry") ?? "0") < Math.round(Date.now() / 1000)
        && localStorage.getItem("todd-refresh") !== null
      );
  }

  static canWrite() {
    return localStorage.getItem("todd-role") === "write" || localStorage.getItem("todd-role") === "admin";
  }

  static isAdmin() {
    return localStorage.getItem("todd-role") === "admin";
  }

  static getAccess() {
    return localStorage.getItem("todd-access");
  }

  static getRefresh() {
    return localStorage.getItem("todd-refresh");
  }
}

type TokenPair = {
  access: string;
  refresh?: string;
}