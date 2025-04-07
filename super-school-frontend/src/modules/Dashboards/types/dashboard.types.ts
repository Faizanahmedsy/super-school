export type DashboardStatsType = {
  id: number;
  title: string;
  count: string;
  new: string;
  badgeColor: string;
  bgcolor: string;
  icon: string;
};

export interface UserCountResp {
  user_limit: number;
  total_admins: number;
  total_teachers: number;
  total_students: number;
  total_parents: number;
}
