import { createApi } from "@reduxjs/toolkit/query/react";

import {
    AddLinkPayload,
    DeleteLinkPayload,
    ReorderLinksPayload,
    UpdateLinkPayload,
} from "../types";
import { customBaseQuery } from "./authAPI";

export const linkApi = createApi({
    reducerPath: "linkApi",
    baseQuery: customBaseQuery,
    endpoints: (builder) => ({
        getLinks: builder.query<AddLinkPayload[], void>({
            query: () => "/links",
        }),
        addLinks: builder.mutation<AddLinkPayload, AddLinkPayload>({
            query: (links) => ({
                url: "/links",
                method: "POST",
                body: links,
            }),
        }),
        updateLinks: builder.mutation<UpdateLinkPayload, UpdateLinkPayload>({
            query: (links) => ({
                url: `/links`,
                method: "PUT",
                body: links,
            }),
        }),
        reorderLinks: builder.mutation<
            ReorderLinksPayload,
            ReorderLinksPayload
        >({
            query: (orderedLinks) => ({
                url: "/links/reorder",
                method: "POST",
                body: orderedLinks,
            }),
        }),
        deleteLink: builder.mutation<void, DeleteLinkPayload>({
            query: ({ id }) => ({
                url: `/links/${id}`,
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
