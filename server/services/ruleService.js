const axios = require("axios");

const getRules = async (session) => {
  const res = await axios.get(
    `${session.instanceUrl}/services/data/v57.0/tooling/query`,
    {
      params: {
        q: `SELECT Id, ValidationName, Active, Description, ErrorMessage, EntityDefinition.QualifiedApiName FROM ValidationRule`,
      },
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    }
  );

  return res.data.records;
};

const updateRule = async (session, id, active, fullName) => {
  const current = await axios.get(
    `${session.instanceUrl}/services/data/v57.0/tooling/sobjects/ValidationRule/${id}`,
    {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    }
  );

  const metadata = current.data.Metadata;

  await axios.patch(
    `${session.instanceUrl}/services/data/v57.0/tooling/sobjects/ValidationRule/${id}`,
    {
      Metadata: {
        ...metadata,
        active,
        fullName,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    }
  );
};

module.exports = {
  getRules,
  updateRule,
};