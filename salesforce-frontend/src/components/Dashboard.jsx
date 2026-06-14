export default function Dashboard({ status, onLogout, onLoadRules }) {
  return (
    <div className="panel">
      <p><b>User:</b> {status.user?.username}</p>
      <p><b>Org:</b> {status.user?.organizationName}</p>
      <p><b>Instance:</b> {status.instanceUrl}</p>

      <div className="actions">
        <button className="logout" onClick={onLogout}>
  Logout
</button>
        <button onClick={onLoadRules}>Load Rules</button>
      </div>
    </div>
  );
}