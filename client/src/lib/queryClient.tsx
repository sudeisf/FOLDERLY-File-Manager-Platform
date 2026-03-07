
import { QueryClient } from 'react-query';

 export const queryClient = new QueryClient({
    defaultOptions:{
        queries: {
            refetchOnWindowFocus: true,
            refetchInterval: 5000,
            staleTime: 5000,
        },
    }
});