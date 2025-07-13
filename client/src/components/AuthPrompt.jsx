import { useState } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AuthPrompt({ onAuthSuccess }) {
  const [showRegister, setShowRegister] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-xl font-bold">Welcome to SnapShift</h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Enter email"
          className="border px-3 py-2 rounded w-full"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter password"
          className="border px-3 py-2 rounded w-full"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
        />
        <button
          disabled={isLoading}
          className={`w-full px-4 py-2 rounded text-white ${
            isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
          onClick={async () => {
            if (isLoading) return;
            setIsLoading(true);
            const endpoint = showRegister ? "/auth/register" : "/auth/login";
            try {
              const res = await fetch(`${BASE_URL}${endpoint}`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  email: emailInput,
                  password: passwordInput,
                }),
              });
              const data = await res.json();
              if (data.token) {
                localStorage.setItem("snapnshift-token", data.token); // TODO: security risk storing jwt token
                onAuthSuccess();
              } else {
                // login/register data validation is handled by backend
                alert(data.message || "Authentication failed");
              }
            } catch (err) {
              console.error(err);
              alert("Network error. Please try again.");
            } finally {
              setIsLoading(false);
            }
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
