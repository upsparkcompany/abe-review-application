let isIntentionalSignOut = false;

export const markIntentionalSignOut = () => {
  isIntentionalSignOut = true;
};

export const consumeIntentionalSignOut = () => {
  const wasIntentional = isIntentionalSignOut;
  isIntentionalSignOut = false;

  return wasIntentional;
};

export const clearIntentionalSignOut = () => {
  isIntentionalSignOut = false;
};
