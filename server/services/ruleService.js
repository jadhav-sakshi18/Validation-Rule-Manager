const axios = require("axios");
const { getSession } = require("../utils/session");

const authHeader = () => ({
  Authorization: `Bearer ${getSession().accessToken}`,
});

const getRules = async () => {
  const session = getSession();

  const res = await axios.get(
    `${session.instanceUrl}/services/data/v57.0/tooling/query`,
    {
      params: {
        q: `SELECT Id, ValidationName, Active, Description, ErrorMessage, EntityDefinition.QualifiedApiName FROM ValidationRule`,
      },
      headers: authHeader(),
    }
  );

  return res.data.records;
};

const updateRule = async (id, active, fullName) => {
  const session = getSession();

  // Fetch existing metadata
  const current = await axios.get(
    `${session.instanceUrl}/services/data/v57.0/tooling/sobjects/ValidationRule/${id}`,
    { headers: authHeader() }
  );

  const metadata = current.data.Metadata;

  // Update
  await axios.patch(
    `${session.instanceUrl}/services/data/v57.0/tooling/sobjects/ValidationRule/${id}`,
    {
      Metadata: {
        ...metadata,
        active,
        fullName,
      },
    },
    { headers: authHeader() }
  );
};

module.exports = {
  getRules,
  updateRule,
};