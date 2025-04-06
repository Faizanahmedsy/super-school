// import {
//   useCreateBatch,
//   useUpdateBatch,
// } from "@/services/management/batch/batch.hook";
// import {
//   useCreateAdmin,
//   useUpdateAdminNew,
// } from "@/services/master/admin/admin.hook";

// export interface CreateEditBatchProps {
//   editMode?: boolean;
// }

// type BatchData = {
//   id: number;
//   batch_name: string;
//   address: string;
//   city: {
//     id: number;
//     city_name: string;
//   };
//   city_id: number;
//   state: {
//     id: number;
//     state_name: string;
//   };
//   state_id: number;
//   registration_number: string;
//   created_at: string;
//   updated_at: string;
// };

// export type BatchApiResponse = {
//   currentPage: number;
//   list: BatchData[];
//   totalCount: number;
//   totalPages: number;
// };

// export interface BatchPayload {
//   batch_name: string;
//   address: string;
//   city_id: number;
//   state_id: number;
//   registration_number: string;
// }

// export type MutationApi =
//   | ReturnType<typeof useCreateBatch>
//   | ReturnType<typeof useUpdateBatch>
//   | ReturnType<typeof useCreateAdmin>
//   | ReturnType<typeof useUpdateAdminNew>;
