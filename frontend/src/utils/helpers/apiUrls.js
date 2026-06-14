// Auth
export const loginUrl = '/user/login/';
export const logoutUrl = '/user/logout/';
export const refreshTokenUrl = '/user/login/refresh/';

// User
export const getCurrentUserUrl = '/user/me/';

// Departments
export const departmentsUrl = '/department/';
export const getDepartmentUrl = (id) => `/department/${id}/`;
export const createDepartmentUrl = '/department/';
export const updateDepartmentUrl = (id) => `/department/${id}/`;
export const deleteDepartmentUrl = (id) => `/department/${id}/`;

// Members
export const membersUrl = '/member/manage-member/';
export const getMemberUrl = (id) => `/member/manage-member/${id}/`;
export const createMemberUrl = '/member/manage-member/hire-member/';
export const updateMemberUrl = (id) => `/member/manage-member/${id}/`;
export const deleteMemberUrl = (id) => `/member/manage-member/${id}/fire-member/`;
export const reactivateMemberUrl = (id) => `/member/manage-member/${id}/reactivate-member/`;

// Projects
export const projectsUrl = '/project/';
export const getProjectUrl = (id) => `/project/${id}/`;
export const createProjectUrl = '/project/';
export const updateProjectUrl = (id) => `/project/${id}/`;
export const deleteProjectUrl = (id) => `/project/${id}/`;

