import axios from "axios";
import FormData from "form-data";
const modelAPILink = "http://127.0.0.1:5000/detect";
export const forwardToLocalApi = async (resFromCloud: any) => {
  const buffer = Buffer.from(resFromCloud.data, "binary");
  const mime = resFromCloud.headers["content-type"];
  const form = new FormData();
  form.append("image", buffer, {
    filename: `DummyName.jpg`,
    contentType: mime,
    knownLength: buffer.length,
  });
  const apiResponse = await axios.post(modelAPILink, form, {
    headers: form.getHeaders(),
  });
  return apiResponse.data;
};
