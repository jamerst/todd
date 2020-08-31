export default class SearchUtils {
  static paramsToQueryString = (p: SearchParams) => {
    let params = [];

    if (p.name !== "") {
      params.push(`name=${p.name}`);
    }
    if (p.type !== -1) {
      params.push(`type=${p.type}`);
    }
    if (p.locationId !== "") {
      params.push(`locationId=${p.locationId}`);
    }
    if (p.pageNum !== 1) {
      params.push(`pageNum=${p.pageNum}`);
    }

    return params.join("&");
  }

  static queryStringToParams = (s: string) => {
    const p = new URLSearchParams(s);
    return {
      name: p.get("name") ?? "",
      type: parseInt(p.get("type") ?? "-1", 10),
      locationId: p.get("locationId") ?? "",
      pageNum: parseInt(p.get("pageNum") ?? "1", 10)
    }
  }
}

export type SearchParams = {
  name: string,
  type: number,
  locationId: string,
  pageNum: number
}

export interface Location {
  id: string,
  name: string
}