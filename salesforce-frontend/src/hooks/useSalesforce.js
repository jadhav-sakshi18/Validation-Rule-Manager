import { useEffect, useMemo, useState } from "react";
import { getStatus, logoutUser } from "../api/authApi";
import { fetchRules, updateRule } from "../api/rulesApi";

export function useSalesforce() {
  const [status, setStatus] = useState({ loggedIn: false, user: null });
  const [rules, setRules] = useState([]);
  const [originalRules, setOriginalRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const changedRules = useMemo(() => {
    return rules.filter((currentRule) => {
      const originalRule = originalRules.find(
        (r) => r.Id === currentRule.Id
      );
      return originalRule && originalRule.Active !== currentRule.Active;
    });
  }, [rules, originalRules]);

  async function checkAuthStatus() {
    try {
      const data = await getStatus();
      setStatus(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function login(environment) {
    window.location.href =
      `${import.meta.env.VITE_API_BASE}/login?env=${environment}`;
  }

  async function logout() {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      // Clear all state values so the application returns to a clean default state
      setStatus({ loggedIn: false, user: null });
      setRules([]);
      setOriginalRules([]);
      setMessage(""); // 👈 FIX: Clears "Changes deployed successfully!" alert on logout
    }
  }

  async function loadRules() {
    setLoading(true);
    setMessage("");

    try {
      const data = await fetchRules();
      setRules(data.records);
      setOriginalRules(structuredClone(data.records));
      setMessage(`Loaded ${data.records.length} rules`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleRule(ruleId) {
    setRules((prev) =>
      prev.map((rule) =>
        rule.Id === ruleId
          ? { ...rule, Active: !rule.Active }
          : rule
      )
    );
  }

  function enableAllRules() {
    setRules((prev) =>
      prev.map((rule) => ({ ...rule, Active: true }))
    );
  }

  function disableAllRules() {
    setRules((prev) =>
      prev.map((rule) => ({ ...rule, Active: false }))
    );
  }

  function rollbackChanges() {
    setRules(structuredClone(originalRules));
    setMessage("Rolled back changes");
  }

  async function deployChanges() {
    setLoading(true);
    setMessage("");

    try {
      await Promise.all(
        changedRules.map((rule) => {
          const objectName =
            rule.EntityDefinition?.QualifiedApiName;

          const fullName = objectName
            ? `${objectName}.${rule.ValidationName}`
            : rule.ValidationName;

          return updateRule(rule.Id, {
            active: rule.Active,
            fullName,
          });
        })
      );

      await loadRules();
      setMessage("Changes deployed successfully!");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return {
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
  };
}