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

      {loading && <p className="message status-loading">Processing...</p>}
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