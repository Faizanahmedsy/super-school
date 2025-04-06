// import {
//   useCreateGrade,
//   useUpdateGrade,
// } from "@/services/management/grade/grade.hook";
// import {
//   useCreateAdmin,
//   useUpdateAdminNew,
// } from "@/services/master/admin/admin.hook";

// export interface CreateEditGradeProps {
//   editMode?: boolean;
// }

// type GradeData = {
//   id: number;
//   grade_name: string;
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

// export type GradeApiResponse = {
//   currentPage: number;
//   list: GradeData[];
//   totalCount: number;
//   totalPages: number;
// };

// export interface GradePayload {
//   grade_name: string;
//   address: string;
//   city_id: number;
//   state_id: number;
//   registration_number: string;
// }

// export type MutationApi =
//   | ReturnType<typeof useCreateGrade>
//   | ReturnType<typeof useUpdateGrade>
//   | ReturnType<typeof useCreateAdmin>
//   | ReturnType<typeof useUpdateAdminNew>;
