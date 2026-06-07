import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_BASE;

function App() {
  const [status, setStatus] = useState({ loggedIn: false, user: null });
  const [rules, setRules] = useState([]);
  const [originalRules, setOriginalRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Changed rules detection
  const changedRules = useMemo(() => {
    return rules.filter((r) => {
      const original = originalRules.find((o) => o.Id === r.Id);
      return original && original.Active !== r.Active;
    });
  }, [rules, originalRules]);

  // STATUS
  async function checkStatus() {
    try {
      const res = await fetch(`${API_BASE}/status`);
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error(err);
    }
  }

  // LOGIN
  function login() {
    window.location.href = `${API_BASE}/login`;
  }

  // LOGOUT
  async function logout() {
    await fetch(`${API_BASE}/logout`);
    setStatus({ loggedIn: false, user: null });
    setRules([]);
    setOriginalRules([]);
    setMessage("");
  }

  // GET RULES
  async function getRules() {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/validation-rules`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to load rules");

      setRules(data.records);
      setOriginalRules(JSON.parse(JSON.stringify(data.records))); // Deep copy
      setMessage(`Loaded ${data.records.length} rules`);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  // TOGGLE
  function toggleRule(id) {
    setRules((prev) =>
      prev.map((r) => (r.Id === id ? { ...r, Active: !r.Active } : r))
    );
  }

  // ENABLE ALL
  function enableAll() {
    setRules((prev) => prev.map((r) => ({ ...r, Active: true })));
  }

  // DISABLE ALL
  function disableAll() {
    setRules((prev) => prev.map((r) => ({ ...r, Active: false })));
  }

  // ROLLBACK
  function rollback() {
    setRules(JSON.parse(JSON.stringify(originalRules)));
    setMessage("Rolled back changes");
  }

  // DEPLOY
  async function deployChanges() {
    setLoading(true);
    setMessage("");

    try {
      const promises = changedRules.map(async (rule) => {
        const entityName = rule.EntityDefinition?.QualifiedApiName;
        const fullName = entityName ? `${entityName}.${rule.ValidationName}` : rule.ValidationName;

        const res = await fetch(`${API_BASE}/validation-rules/${rule.Id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            active: rule.Active,
            fullName: fullName,
            errorConditionFormula: rule.ErrorConditionFormula, // Re-submitting payload
            errorMessage: rule.ErrorMessage,
            errorDisplayField: rule.ErrorDisplayField,
            description: rule.Description
          }),
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `Error updating rule ${rule.ValidationName}`);
      });

      await Promise.all(promises);
      await getRules();
      setMessage("Changes deployed successfully!");
    } catch (err) {
      setMessage(err.message);
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
        <div className="login-container">
          <div className="login-card">
            <h2>Login Required</h2>
            <button className="login-btn" onClick={login}>
              Login with Salesforce
            </button>
          </div>
        </div>
      ) : (
        <div className="panel">
          <p><b>User:</b> {status.user?.username || "Connected Account"}</p>
          <p><b>Instance/Org:</b> {status.instanceUrl}</p>

          <div className="actions">
            <button onClick={logout}>Logout</button>
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
            <button 
              onClick={deployChanges} 
              disabled={changedRules.length === 0}
              style={{ opacity: changedRules.length === 0 ? 0.5 : 1 }}
            >
              Deploy ({changedRules.length})
            </button>
          </div>

          <table>
            <thead>
              <tr>
                <th>Rule</th>
                <th>Object</th>
                <th>State</th>
                <th>Toggle</th>
              </tr>
            </thead>

            <tbody>
              {rules.map((rule) => (
                <tr key={rule.Id}>
                  <td>{rule.ValidationName}</td>
                  <td>{rule.EntityDefinition?.QualifiedApiName || "Global"}</td>
                  <td>
  <span className={`badge ${rule.Active ? "active" : "inactive"}`}>
    {rule.Active ? "Active" : "Inactive"}
  </span>
</td>
                  <td>
  <label className="switch" title={rule.Active ? "Deactivate Rule" : "Activate Rule"}>
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