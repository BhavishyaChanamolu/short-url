import React, { useState, useEffect } from "react";
import "./login.css";
import { useNavigate } from "react-router-dom"; // ⬅️ Add this

const initialLogin = { email: "", password: "" };
const initialSignup = { name: "", email: "", password: "", confirm: "" };

const AuthPage = () => {
  const navigate = useNavigate(); // ⬅️ Add this
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialLogin);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    setForm(mode === "login" ? initialLogin : initialSignup);
    setErrors({});
  }, [mode]);

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = "Email required";
    if (!form.password) errs.password = "Password required";
    if (mode === "signup") {
      if (!form.name) errs.name = "Name required";
      if (form.password !== form.confirm) errs.confirm = "Passwords do not match";
    }
    return errs;
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setToast("");

    try {
      const url = `http://localhost:3000/${mode === "signup" ? "signup" : "login"}`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include", // send/receive cookies
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          pass: form.password,     // for signup
          password: form.password  // for login
        })
      });

      const data = await res.json();

      if (res.ok) {
  setToast(`${mode === "login" ? "Login" : "Signup"} Successful!`);
  localStorage.setItem("token", data.token); // optional
  navigate("/home"); // ⬅️ Redirect to landing page
}
 else {
        setToast(data.error || "Something went wrong.");
      }
    } catch (err) {
      setToast("Server error. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="bg">
      <header className="header">
        <div className="headerContainer">
          <div className="logo">ShortenIt</div>
          <nav className="nav">
  <button
    className={`navBtn ${mode === "login" ? "active-tab" : ""}`}
    onClick={() => setMode("login")}
  >
    Login
  </button>
  <button
    className={`navBtn signup ${mode === "signup" ? "active-tab" : ""}`}
    onClick={() => setMode("signup")}
  >
    Sign Up
  </button>
  
</nav>

        </div>
      </header>

      <div className="wrapper">
        <div className="card">
          <div className="tabs">
            <div className={`tab ${mode === "login" ? "active" : ""}`} onClick={() => setMode("login")}>
              Login
            </div>
            <div className={`tab ${mode === "signup" ? "active" : ""}`} onClick={() => setMode("signup")}>
              Sign Up
            </div>
          </div>
          <h2 className="title">Shorten your links</h2>
          <form onSubmit={handleSubmit} className="form">
            {mode === "signup" && (
              <input
                className="input"
                type="text"
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
              />
            )}
            <input
              className="input"
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />
            <input
              className="input"
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />
            {mode === "signup" && (
              <input
                className="input"
                type="password"
                name="confirm"
                placeholder="Confirm Password"
                value={form.confirm}
                onChange={handleChange}
              />
            )}
            <button className="button" type="submit" disabled={loading}>
              {loading ? "Processing..." : mode === "login" ? "Login" : "Sign Up"}
            </button>
          </form>
          <p className="policy">
            By clicking {mode === "login" ? "LOGIN" : "SIGN UP"}, you agree to LinkShort's Terms and Privacy Policy.
          </p>
          {toast && <div className="toast">{toast}</div>}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
