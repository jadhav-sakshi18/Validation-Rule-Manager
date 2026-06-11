export default function Login({ onLogin }) {
  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome Back</h2>

        <p className="login-subtitle">
          Choose your Salesforce environment
        </p>

        <button
          className="login-btn"
          onClick={() => onLogin("production")}
        >
          Login with Production
        </button>

        <button
          className="login-btn"
          style={{ marginTop: "10px", background: "#22c55e" }}
          onClick={() => onLogin("sandbox")}
        >
          Login with Sandbox
        </button>

        <p className="login-footer">
          Secure OAuth Login
        </p>
      </div>
    </div>
  );
}