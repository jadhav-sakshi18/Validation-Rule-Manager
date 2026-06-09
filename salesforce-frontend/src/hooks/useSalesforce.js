import { useEffect, useMemo, useState } from "react";
import { fetchJSON } from "../api/apiClient";

export function useSalesforce() {
  const [status, setStatus] = useState({ loggedIn: false, user: null });
  const [rules, setRules] = useState([]);
  const [originalRules, setOriginalRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const changedRules = useMemo(() => {
    return rules.filter((rule) => {
      const original = originalRules.find(
        (originalRule) => originalRule.Id === rule.Id
      );
      return original && original.Active !== rule.Active;
    });
  }, [rules, originalRules]);

  async function checkStatus() {
    try {
      const data = await fetchJSON("/status");
      setStatus(data);
    } catch (error) {
      console.error(error);
    }
  }

  function login() {
    window.location.href = `${import.meta.env.VITE_API_BASE}/login`;
  }

  async function logout() {
    await fetchJSON("/logout");
    setStatus({ loggedIn: false, user: null });
    setRules([]);
    setOriginalRules([]);
  }

  async function loadRules() {
    setLoading(true);
    setMessage("");

    try {
      const data = await fetchJSON("/validation-rules");
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
    setRules((prevRules) =>
      prevRules.map((rule) =>
        rule.Id === ruleId ? { ...rule, Active: !rule.Active } : rule
      )
    );
  }

  function enableAllRules() {
    setRules((prevRules) =>
      prevRules.map((rule) => ({ ...rule, Active: true }))
    );
  }

  function disableAllRules() {
    setRules((prevRules) =>
      prevRules.map((rule) => ({ ...rule, Active: false }))
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
        changedRules.map(async (rule) => {
          const entityName = rule.EntityDefinition?.QualifiedApiName;
          const fullName = entityName
            ? `${entityName}.${rule.ValidationName}`
            : rule.ValidationName;

          await fetchJSON(`/validation-rules/${rule.Id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              active: rule.Active,
              fullName,
            }),
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
    checkStatus();
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