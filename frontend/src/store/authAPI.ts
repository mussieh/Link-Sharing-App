import {
    BaseQueryApi,
    createApi,
    FetchArgs,
    fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../utils/constants";
import { setIsAuthenticated } from "./authSlice";

// Define the types for the authentication response and request data
interface LoginResponse {
    accessToken: string;
}

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterResponse {
    accessToken: string;
}

interface RegisterCredentials {
    email: string;
    password: string;
}

export const customBaseQuery = async (
    args: string | FetchArgs,
    api: BaseQueryApi,
    extraOptions: object
) => {
    const baseQuery = fetchBaseQuery({
        baseUrl: BASE_URL,
        credentials: "include",
    });

    // Await the result from baseQuery
    const result = await baseQuery(args, api, extraOptions);

    // Check for error response
    if (result.error && result.error.status === 401) {
        api.dispatch(authApi.endpoints.logout.initiate());
    }

    return result;
};

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: customBaseQuery,
    endpoints: (builder) => ({
        checkAuth: builder.query<boolean, void>({
            query: () => ({
                url: "/auth/check",
                method: "GET",
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(setIsAuthenticated(true));
                } catch (error) {
                    dispatch(setIsAuthenticated(false));
                    console.log(
                        "Authentication check failed, logging out.",
                        error
                    );
                }
            },
        }),
        login: builder.mutation<LoginResponse, LoginCredentials>({
            query: (credentials) => ({
                url: "/auth/login",
                method: "POST",
                body: credentials,
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(setIsAuthenticated(true));
                } catch (error) {
                    console.log(error);
                    dispatch(setIsAuthenticated(false));
                }
            },
        }),
        register: builder.mutation<RegisterResponse, RegisterCredentials>({
            query: (userData) => ({
                url: "/auth/register",
                method: "POST",
                body: userData,
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(setIsAuthenticated(true));
                } catch (error) {
                    console.log(error);
                    dispatch(setIsAuthenticated(false));
                }
            },
        }),
        logout: builder.mutation<void, void>({
            query: () => ({
                url: "/auth/logout",
                method: "POST",
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    dispatch(setIsAuthenticated(false));
                } catch (error) {
                    console.log(error);
                }
            },
        }),
    }),
});

export const {
    useCheckAuthQuery,
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
} = authApi;
