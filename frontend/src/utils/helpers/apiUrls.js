// Auth
export const loginUrl = '/user/login/';
export const logoutUrl = '/user/logout/';

// User
export const getCurrentUserUrl = '/user/me/';

// Departments
export const departmentsUrl = '/department/';
export const getDepartmentUrl = (id) => `/department/${id}/`;
export const createDepartmentUrl = '/department/';
export const updateDepartmentUrl = (id) => `/department/${id}/`;
export const deleteDepartmentUrl = (id) => `/department/${id}/`;

// Members
export const membersUrl = '/member/';
export const getMemberUrl = (id) => `/member/${id}/`;
export const createMemberUrl = '/member/';
export const updateMemberUrl = (id) => `/member/${id}/`;
export const deleteMemberUrl = (id) => `/member/${id}/`;

