import axios from "axios";
import API from "../utils/utils";
import { decryptToken } from "../utils/crypto";

const getProperties = async (page = 1, limit = 20, filters = {}) => {
    try {
        const response = await axios.get(`${API.PROPERTIES}/all?page=${page}&limit=${limit}`, {
            headers: {
                Authorization: `Bearer ${decryptToken()}`
            },
            params: filters
        });
        return response;
    } catch (error) {
        console.error("Error fetching properties:", error);
        return error.response;
    }
}

const PROPERTIES = {
    GET: getProperties
}

export default PROPERTIES;
