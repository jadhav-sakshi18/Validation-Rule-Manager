import "./App.css";
import { useSalesforce } from "./hooks/useSalesforce";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import RulesTable from "./components/RulesTable";

function App() {
  const {
    status,
    rules,
    loading,
    message,
    changedRules,
    login,
    logout,
    loadRules,
    toggleRule,
    enableAllRules,
    disableAllRules,
    rollbackChanges,
    deployChanges,
  } = useSalesforce();

  // FIX: If the initial handshake/status check with the backend is still running,
  // show a clean loading screen instead of flashing the login layout.
  // (Assuming your useSalesforce hook handles the initial status loading via `loading`)
  if (loading && !status.loggedIn && rules.length === 0) {
    return (
      <div className="container" style={{ textAlign: "center", marginTop: "100px" }}>
        <h1>Salesforce Validation Rule Manager</h1>
        <p className="message status-loading">Verifying session... Please wait.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Salesforce Validation Rule Manager</h1>

      {!status.loggedIn ? (
        <Login onLogin={login} />
      ) : (
        <Dashboard
          status={status}
          onLogout={logout}
          onLoadRules={loadRules}
        />
      )}

      {/* This handles background actions like fetching rules or deploying */}
      {loading && rules.length > 0 && (
        <p className="message status-loading">Processing...</p>
      )}
      
      {message && <p className="message">{message}</p>}

      {rules.length > 0 && (
        <RulesTable
          rules={rules}
          onToggle={toggleRule}
          onEnableAll={enableAllRules}
          onDisableAll={disableAllRules}
          onRollback={rollbackChanges}
          onDeploy={deployChanges}
          changedCount={changedRules.length}
        />
      )}
    </div>
  );
}

export default App;