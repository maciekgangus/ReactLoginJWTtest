import { useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthProvider";

const LoginPage = () => {
  const { setToken, setUser, setIsLoggedIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/api/login", {
        email,
        password,
      });

      setToken(res.data.token);
      setUser(res.data.user);
      setIsLoggedIn(true);
    } catch (err) {
      setError("Nieprawidłowy email lub hasło");
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Zaloguj się</h2>

        <label className="block mb-2 text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          className="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring focus:border-blue-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="block mb-2 text-sm font-medium text-gray-700">
          Hasło
        </label>
        <input
          type="password"
          className="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring focus:border-blue-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Zaloguj
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
