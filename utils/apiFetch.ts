import { CustomError } from "./error.handler";
import { HttpStatus } from "./HttpStatus";

export async function apiFetch(
  api: string,
  headers: Record<string, string>,
  method: string,
  body?: any
): Promise<any> {
  try {
    let props = {
      method: method,
      headers: headers,
    };
    if (method === "POST") {
      //@ts-ignore
      props.body = JSON.stringify(body);
    }
    const response = await fetch(api, props);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    new CustomError(
      "API Error",
      "Error While Fetching Data",
      HttpStatus.BAD_REQUEST
    );
  }
}
