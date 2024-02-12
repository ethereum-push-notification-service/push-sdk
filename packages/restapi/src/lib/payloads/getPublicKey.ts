import { ENV } from "../constants";
import { getAPIBaseUrls } from "../helpers";
import { axiosGet } from "../utils/axiosUtil";


export async function getPublicKeyFromPushNodes(address: string, env: ENV): Promise<string | null> {

        const API_BASE_URL = getAPIBaseUrls(env);
        const requestURL = `${API_BASE_URL}/v1/encryption_keys/${address}`;
        return axiosGet(requestURL)
        .then((response) => {
         if(response.data.keys){
            return response.data.keys.publicKey
         } else {
            return null
         }
        })
        .catch((err) => {
          console.error(`[Push SDK] - API ${requestURL}: `, err);
          return null
        });
    }