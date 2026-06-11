import { useQuery } from "@tanstack/react-query";
import {authorizedRequest} from "../../utils/helpers/http.js";
import {getAdminDetailsUrl} from "../../utils/helpers/apis.js";

export const useAdminProfile = () => {
    return useQuery({
        queryKey: ["adminProfile"],
        queryFn: async () => {
            return authorizedRequest({
                url: getAdminDetailsUrl,
                method: "GET",
            });
        },
        staleTime: Infinity, // Keep cached data forever until invalidated
        cacheTime: Infinity, // Keep it in cache even if unused
        // staleTime: 30 * 60 * 1000, // 30 minutes
        // cacheTime: 60 * 60 * 1000, // 1 hour
    });
};