import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./authAPI";

export const linkApi = createApi({
    reducerPath: "linkApi",
    baseQuery,
    endpoints: (builder) => ({
        getLinks: builder.query({
            query: () => "/links",
        }),
        addLinks: builder.mutation({
            query: (links) => ({
                url: "/links",
                method: "POST",
                body: links,
            }),
        }),
        updateLinks: builder.mutation({
            query: (links) => ({
                url: `/links`,
                method: "PUT",
                body: links,
            }),
        }),
        reorderLinks: builder.mutation({
            query: (orderedLinks) => ({
                url: "/links/reorder",
                method: "POST",
                body: orderedLinks,
            }),
        }),
        deleteLink: builder.mutation({
            query: (linkId) => ({
                url: `/links/${linkId}`,
                method: "DELETE",
            }),
        }),
    }),
});

export const {
    useGetLinksQuery,
    useAddLinksMutation,
    useUpdateLinksMutation,
    useReorderLinksMutation,
    useDeleteLinkMutation,
} = linkApi;
