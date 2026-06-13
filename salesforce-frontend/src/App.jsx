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

  // FIX: Keep the clean session verification banner active while checking backend credentials. 
  // Prevents the login screen form flashing up layout transitions incorrectly.
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

      {/* Handles background actions cleanly without breaking core conditional block layouts */}
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