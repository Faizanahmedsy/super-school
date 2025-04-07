import useGlobalState from '@/store';

export default function useGetRole() {
  const user = useGlobalState((state) => state.user);
  const role = user?.role_name;

  return role;
}
