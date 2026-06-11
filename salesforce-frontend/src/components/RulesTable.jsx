export default function RulesTable({
  rules,
  onToggle,
  onEnableAll,
  onDisableAll,
  onRollback,
  onDeploy,
  changedCount,
}) {
  return (
    <div className="panel">
      <div className="actions">
        <button onClick={onEnableAll}>Enable All</button>
        <button onClick={onDisableAll}>Disable All</button>
        <button onClick={onRollback}>Rollback</button>
        <button onClick={onDeploy} disabled={!changedCount}>
          Deploy ({changedCount})
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
      onChange={() => onToggle(rule.Id)}
    />
    <span className="slider"></span>
  </label>
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}