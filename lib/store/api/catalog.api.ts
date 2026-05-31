import { baseApi } from './base-api';
import type {
  CatalogListPayload,
  CatalogDetailPayload,
} from '@/types/franchises.types';

/**
 * Public catalog endpoints — no auth header. Powers the landing page
 * (grouped franchise grid) and the public franchise detail page (hierarchy
 * tree + map + Buy now hook).
 */
export const catalogApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCatalog: build.query<CatalogListPayload, void>({
      query: () => '/catalog/franchises',
    }),
    getCatalogDetail: build.query<CatalogDetailPayload, string>({
      query: (id) => `/catalog/franchises/${id}`,
    }),
  }),
  overrideExisting: false,
});

export const { useGetCatalogQuery, useGetCatalogDetailQuery } = catalogApi;
