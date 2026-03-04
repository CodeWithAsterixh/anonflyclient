export const validateUsername = (username: string): boolean => {
  return username.trim().length >= 3 && username.trim().length <= 30 && /^\w+$/.test(username.trim());
};

export const validateRoomname = (roomname: string): boolean => {
  return roomname.trim().length >= 3 && roomname.trim().length <= 50;
};

export const validateDescription = (description?: string): boolean => {
  if (!description) return true;
  return description.trim().length <= 200;
};

export const validateRoomPassword = (password?: string): boolean => {
  if (!password) return true;
  return password.length >= 4 && password.length <= 50;
};

export const validateEmail = (email: string): boolean => {
  // Basic email validation regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePassword = (password: string): boolean => {
  // Password must be at least 6 characters long, contain at least one uppercase letter, one lowercase letter, and one number.
  return password.length >= 6 &&
         /[A-Z]/.test(password) &&
         /[a-z]/.test(password) &&
         /\d/.test(password);
};
