let session = {
  accessToken: null,
  instanceUrl: null,
  user: null,
};

const setSession = (data) => {
  session = { ...session, ...data };
};

const getSession = () => session;

const clearSession = () => {
  session = {
    accessToken: null,
    instanceUrl: null,
    user: null,
  };
};

module.exports = {
  setSession,
  getSession,
  clearSession,
};