import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./authAPI";

export const profileApi = createApi({
    reducerPath: "profileApi",
    baseQuery,
    endpoints: (builder) => ({
        getProfile: builder.query({
            query: (userId) => `/profile/${userId}`,
        }),
        createProfile: builder.mutation({
            query: (profileData) => ({
                url: "/profile",
                method: "POST",
                body: profileData,
            }),
        }),
        updateProfile: builder.mutation({
            query: ({ profileData, userId }) => ({
                url: `/profile/${userId}`,
                method: "PUT",
                body: profileData,
            }),
        }),
    }),
});

export const {
    useGetProfileQuery,
    useCreateProfileMutation,
    useUpdateProfileMutation,
} = profileApi;
