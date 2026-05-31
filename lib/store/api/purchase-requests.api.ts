import { baseApi } from './base-api';

export interface CreatePurchaseRequestBody {
  franchise_id: string;
  full_name: string;
  email: string;
  phone?: string;
  message?: string;
}

export interface PurchaseRequestPublic {
  _id: string;
  franchise_id: string;
  franchise_code: string;
  franchise_display_name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export const purchaseRequestsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    submitPurchaseRequest: build.mutation<PurchaseRequestPublic, CreatePurchaseRequestBody>({
      query: (body) => ({ url: '/purchase-requests', method: 'POST', body }),
    }),
  }),
  overrideExisting: false,
});

export const { useSubmitPurchaseRequestMutation } = purchaseRequestsApi;
