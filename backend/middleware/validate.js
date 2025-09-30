export const noTripleRepeat = (value) => {
  return !(/(.)\1{2,}/.test(String(value)));
};

export const isSriLankaPhone = (value) => /^(?:\+947\d{8}|07\d{8})$/.test(String(value));

export const strongPassword = (value) => /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}\[\]:;"'<>?,./]).{8,}$/.test(String(value));

export const noDigitsInName = (value) => /^[A-Za-z ]+$/.test(String(value));
