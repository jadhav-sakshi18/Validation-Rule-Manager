export default function Login({ onLogin }) {
  return (
    <div className="login-container">
      <div className="login-card">
        

        <h2>Welcome Back</h2>

        <p className="login-subtitle">
          Manage your Salesforce validation rules effortlessly
        </p>

        <button className="login-btn" onClick={onLogin}>
          Continue with Salesforce
        </button>

        <div className="login-divider">
          <span>Secure OAuth Access</span>
        </div>

        <p className="login-footer">
          Your data stays safe. No credentials stored.
        </p>
      </div>
    </div>
  );
}