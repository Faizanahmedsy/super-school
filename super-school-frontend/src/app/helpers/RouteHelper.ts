// export const checkPermission = (routeRole: any, userRole: any) => {
//   if (!routeRole || !routeRole) {
//     return true;
//   }

//   if (userRole && Array.isArray(userRole) && !Array.isArray(routeRole)) {
//     return userRole.indexOf(routeRole) >= 0;
//   }
//   if (routeRole.length === 0) {
//     return !userRole || userRole.length === 0;
//   }
//   if (userRole && Array.isArray(userRole) && Array.isArray(routeRole)) {
//     return routeRole.some((r) => userRole.indexOf(r) >= 0);
//   }
//   return routeRole.indexOf(userRole) >= 0;
// };

type Role = string | string[]; // Can be a single role or an array of roles

export const checkPermission = (routeRole: Role, userRole: Role): boolean => {
  // If no specific role is required, allow access
  if (!routeRole) {
    return true;
  }

  // If userRole is an array and routeRole is a single string
  if (Array.isArray(userRole) && typeof routeRole === 'string') {
    return userRole.includes(routeRole);
  }

  // If routeRole is an empty array, allow if userRole is also empty or undefined
  if (Array.isArray(routeRole) && routeRole.length === 0) {
    return !userRole || (Array.isArray(userRole) && userRole.length === 0);
  }

  // If both userRole and routeRole are arrays, check for any intersection
  if (Array.isArray(userRole) && Array.isArray(routeRole)) {
    return routeRole.some((role) => userRole.includes(role));
  }

  // If routeRole is an array and userRole is a string, check for inclusion
  if (Array.isArray(routeRole) && typeof userRole === 'string') {
    return routeRole.includes(userRole);
  }

  // If both are strings, directly compare them
  return routeRole === userRole;
};
