const validationMessages = {
  required: 'This field is required.',
  minMaxLength: (min, max) => `the field must contain from ${min} to ${max} characters.`,
  invalidCharacters: 'You have entered invalid characters.',
};

const usernameRegex = /^[A-Za-zА-Яа-я0-9_-]+$/;
const passwordRegex = /^[A-Za-z0-9!@#$%^&*()_+=\-[\]{};':"\\|,.<>/?]+$/;

function validateName(value) {
  if (!value.length) {
    return validationMessages.required;
  }

  if (!usernameRegex.test(value)) {
    return validationMessages.invalidCharacters;
  }

  if (value.length < 4 || value.length > 15) {
    return validationMessages.minMaxLength(4, 15);
  }

  return null;
}

function validatePassword(value) {
  if (!value.length) {
    return validationMessages.required;
  }

  if (!passwordRegex.test(value)) {
    return validationMessages.invalidCharacters;
  }

  if (value.length < 6 || value.length > 30) {
    return validationMessages.minMaxLength(6, 30);
  }

  return null;
}

export { validateName, validatePassword };
