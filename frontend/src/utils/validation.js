export const noTripleRepeat = (v) => !(/(.)\1{2,}/.test(String(v)));
export const isPhone = (v) => /^(?:\+947\d{8}|07\d{8})$/.test(String(v));
export const strongPassword = (v) => /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}\[\]:;"'<>?,./]).{8,}$/.test(String(v));
export const onlyLetters = (v) => /^[A-Za-z ]+$/.test(String(v));
