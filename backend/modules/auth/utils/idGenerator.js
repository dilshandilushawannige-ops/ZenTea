const PREFIX = {
  'Admin': 'AD',
  'Collector': 'CL',
  'Supplier': 'SP',
  'Employee': 'EM',
  'Customer': 'CU'
};

export const nextRoleId = async (role, User) => {
  const prefix = PREFIX[role];
  if (!prefix) throw new Error('Invalid role for ID generation');
  // Find highest existing
  const last = await User.findOne({ role }).sort({ createdAt: -1 }).select('uniqueId');
  let num = 0;
  if (last && last.uniqueId && last.uniqueId.startsWith(prefix)) {
    const part = last.uniqueId.replace(prefix, '');
    const parsed = parseInt(part, 10);
    if (!Number.isNaN(parsed)) num = parsed;
  }
  const next = (num + 1).toString().padStart(3, '0');
  return `${prefix}${next}`;
};
