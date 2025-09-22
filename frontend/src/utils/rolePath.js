export const roleHome = (role) => {
  if (!role) return '/';
  const normalized = role.toString().trim().toLowerCase();

  if (normalized.includes('admin')) return '/admin';
  if (normalized.includes('collector')) return '/collector';
  if (normalized.includes('supplier')) return '/supplier';
  if (normalized.includes('employee')) return '/employee';
  if (normalized.includes('customer')) return '/customer';

  return '/';
};
