const parseContactType = (type) => {
  const isString = typeof type === 'string';
  if (!isString) return;

  const isCorrectType = (type) => ['work', 'home', 'personal'].includes(type);

  if (isCorrectType(type)) return type;
};

const parseBoolean = (bool) => {
  const isString = typeof bool === 'string';
  if (!isString) return;

  const isTrue = bool === 'true';

  return isTrue;
};

export const parseFilterParams = (query) => {
  const { type, isFavourite } = query;

  const parsedContactType = parseContactType(type);
  const parsedBoolean = parseBoolean(isFavourite);

  return {
    type: parsedContactType,
    isFavourite: parsedBoolean,
  };
};
