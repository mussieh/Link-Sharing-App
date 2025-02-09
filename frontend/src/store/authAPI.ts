import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { clearAccessToken, setAccessToken } from "./authSlice";
import { RootState } from "./store";

export const baseQuery = fetchBaseQuery({
    baseUrl: "http://localhost:4000/api/v1",
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).auth.accessToken;
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
        return headers;
    },
});

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery,
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: "/auth/login",
                method: "POST",
                body: credentials,
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setAccessToken(data.accessToken));
                } catch (error) {
                    console.log(error);
                }
            },
        }),
        register: builder.mutation({
            query: (userData) => ({
                url: "/auth/register",
                method: "POST",
                body: userData,
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setAccessToken(data.accessToken));
                } catch (error) {
                    console.log(error);
                }
            },
        }),
        refreshToken: builder.mutation({
            query: () => ({
                url: "/auth/refresh",
                method: "POST",
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setAccessToken(data.accessToken));
                } catch (error) {
                    console.log(error);
                }
            },
        }),
        logout: builder.mutation({
            query: () => ({
                url: "/auth/logout",
                method: "POST",
            }),
            onQueryStarted(_, { dispatch }) {
                dispatch(clearAccessToken());
            },
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useRefreshTokenMutation,
    useLogoutMutation,
} = authApi;
