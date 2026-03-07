

import {useQuery} from "@tanstack/react-query";
import axios from "axios";


const fetchFolders = async () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const {data} = await axios.get(`${API_URL}/api/folders/folder-list`, { withCredentials: true });
    return data;
};


export const useFolder = () => {

    const {
        data,
        isLoading,
        error,
        refetch,
    } =
    useQuery(
    {
        queryKey: ["folders"],
        queryFn: fetchFolders,
        staleTime: 30000,
        refetchOnWindowFocus: true,
    });

    return {data, isLoading, error, refetch};
}