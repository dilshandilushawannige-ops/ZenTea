export const nextTxnId = () => {
  const rand = Math.floor(Math.random() * 90000) + 10000;
  return `TXN${Date.now()}${rand}`;
};
