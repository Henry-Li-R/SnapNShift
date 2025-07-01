import { useState } from "react";

export default function AuthPrompt({ onAuthSuccess }) {
  const [showRegister, setShowRegister] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-xl font-bold">Welcome to SnapShift</h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Enter username"
          className="border px-3 py-2 rounded w-full"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter password"
          className="border px-3 py-2 rounded w-full"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
        />
        <button
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => {
            const endpoint = showRegister ? "/auth/register" : "/auth/login";
            fetch(`http://localhost:3001${endpoint}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                username: usernameInput,
                password: passwordInput,
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.token) {
                  localStorage.setItem("snapnshift-token", data.token);
                  onAuthSuccess();
                } else {
                  alert(data.message || "Authentication failed");
                }
              });
          }}
        >
          {showRegister ? "Register" : "Login"}
        </button>
        <p className="text-sm text-center">
          {showRegister ? "Already have an account?" : "New user?"}{" "}
          <button
            className="text-blue-500 hover:underline"
            onClick={() => setShowRegister(!showRegister)}
          >
            {showRegister ? "Login" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
}