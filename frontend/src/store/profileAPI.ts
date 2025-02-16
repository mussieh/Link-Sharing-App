import { createApi } from "@reduxjs/toolkit/query/react";

import { CreateProfilePayload, UpdateProfilePayload } from "../types";

import { customBaseQuery } from "./authAPI";

export const profileApi = createApi({
    reducerPath: "profileApi",
    baseQuery: customBaseQuery,
    endpoints: (builder) => ({
        getProfile: builder.query<CreateProfilePayload, string>({
            query: (userId) => `/profile/${userId}`,
        }),
        createProfile: builder.mutation<
            CreateProfilePayload,
            CreateProfilePayload
        >({
            query: (profileData) => ({
                url: "/profile",
                method: "POST",
                body: profileData,
            }),
        }),
        updateProfile: builder.mutation<
            UpdateProfilePayload,
            { profileData: UpdateProfilePayload; userId: string }
        >({
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
