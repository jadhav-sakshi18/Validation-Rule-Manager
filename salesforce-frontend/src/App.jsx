import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Login from "./components/Login";


const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function App() {
  const [status, setStatus] = useState({ loggedIn: false, user: null });
  const [rules, setRules] = useState([]);
  const [originalRules, setOriginalRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const changedRules = useMemo(() => {
    return rules.filter((rule) => {
      const original = originalRules.find((r) => r.Id === rule.Id);
      return original && original.Active !== rule.Active;
    });
  }, [rules, originalRules]);

  async function fetchJSON(url, options = {}) {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Request failed");
    return data;
  }

  async function checkStatus() {
    try {
      const data = await fetchJSON(`${API_BASE}/status`);
      setStatus(data);
    } catch (error) {
      console.error(error);
    }
  }

  function login() {
    window.location.href = `${API_BASE}/login`;
  }

  async function logout() {
    try {
      await fetch(`${API_BASE}/logout`);
    } finally {
      setStatus({ loggedIn: false, user: null });
      setRules([]);
      setOriginalRules([]);
      setMessage("");
    }
  }

  async function getRules() {
    setLoading(true);
    setMessage("");

    try {
      const data = await fetchJSON(`${API_BASE}/validation-rules`);
      setRules(data.records);
      setOriginalRules(structuredClone(data.records));
      setMessage(`Loaded ${data.records.length} rules`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleRule(id) {
    setRules((prev) =>
      prev.map((rule) =>
        rule.Id === id ? { ...rule, Active: !rule.Active } : rule
      )
    );
  }

  function enableAll() {
    setRules((prev) => prev.map((rule) => ({ ...rule, Active: true })));
  }

  function disableAll() {
    setRules((prev) => prev.map((rule) => ({ ...rule, Active: false })));
  }

  function rollback() {
    setRules(structuredClone(originalRules));
    setMessage("Rolled back changes");
  }

  async function deployChanges() {
    setLoading(true);
    setMessage("");

    try {
      await Promise.all(
        changedRules.map(async (rule) => {
          const entity = rule.EntityDefinition?.QualifiedApiName;
          const fullName = entity
            ? `${entity}.${rule.ValidationName}`
            : rule.ValidationName;

          await fetchJSON(`${API_BASE}/validation-rules/${rule.Id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              active: rule.Active,
              fullName,
            }),
          });
        })
      );

      await getRules();
      setMessage("Changes deployed successfully!");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="container">
      <h1>Salesforce Validation Rule Manager</h1>

      {!status.loggedIn ? (
        <Login onLogin={login} />
      ) : (
        <div className="panel">
          <p><b>User:</b> {status.user?.username}</p>
          <p><b>Org:</b> {status.user?.organizationName}</p>
          <p><b>Instance:</b> {status.instanceUrl}</p>

          <div className="actions">
            <button className="logout" onClick={logout}>Logout</button>
            <button onClick={getRules}>Load Rules</button>
          </div>
        </div>
      )}

      {loading && <p className="message status-loading">Processing...</p>}
      {message && <p className="message">{message}</p>}

      {rules.length > 0 && (
  <div className="panel">
    <div className="actions">
      <button onClick={enableAll}>Enable All</button>
      <button onClick={disableAll}>Disable All</button>
      <button onClick={rollback}>Rollback</button>
      <button onClick={deployChanges} disabled={!changedRules.length}>
        Deploy ({changedRules.length})
      </button>
    </div>

    <table>
      <thead>
        <tr>
          <th>Rule</th>
          <th>Object</th>
          <th>Status</th>
          <th>Toggle</th>
        </tr>
      </thead>

      <tbody>
        {rules.map((rule) => (
          <tr key={rule.Id}>
            <td>{rule.ValidationName}</td>
            <td>{rule.EntityDefinition?.QualifiedApiName}</td>

            <td>
              <span className={`badge ${rule.Active ? "active" : "inactive"}`}>
                {rule.Active ? "Active" : "Inactive"}
              </span>
            </td>

            <td>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={rule.Active}
                  onChange={() => toggleRule(rule.Id)}
                />
                <span className="slider"></span>
              </label>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
    </div>
  );
}

export default App;