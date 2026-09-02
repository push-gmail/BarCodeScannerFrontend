import {
  useState,
} from "react";

import {
  forgotPassword,
  loginUser,
  registerUser,
} from "../api/authApi";

import {
  saveSession,
} from "../store/auth";

type Props = {
  open: boolean;
  onClose: () => void;
  onLoggedIn: () => void;
};

type Mode =
  | "login"
  | "register"
  | "forgot";

export default function AuthModal({
  open,
  onClose,
  onLoggedIn,
}: Props) {
  const [mode, setMode] =
    useState<Mode>("login");

  const [form, setForm] =
    useState({
      name: "",
      country: "India",
      pincode: "",
      email: "",
      phone: "",
      password: "",
    });

  const [msg, setMsg] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  if (!open) {
    return null;
  }

  const change = (
    key: string,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const switchMode = (
    nextMode: Mode
  ) => {
    setMsg("");
    setMode(nextMode);
  };

  const submit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setMsg("");
    setLoading(true);

    try {
      /* ================================
         REGISTER
      ================================= */

      if (
        mode === "register"
      ) {
        await registerUser(
          form
        );

        setMode("login");

        setMsg(
          "Registered successfully. Please login."
        );

        return;
      }

      /* ================================
         FORGOT PASSWORD
      ================================= */

      if (
        mode === "forgot"
      ) {
        const { data } =
          await forgotPassword(
            form.email
          );

        setMsg(
          data.message ||
            "Reset password link sent."
        );

        return;
      }

      /* ================================
         LOGIN
      ================================= */

      const { data } =
        await loginUser(
          form.email,
          form.password
        );

      saveSession(
        data.token,
        "user"
      );

      onLoggedIn();
      onClose();
    } catch (err: any) {
      setMsg(
        err?.response?.data
          ?.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modalBack">
      <div className="modalCard">
        <button
          className="close"
          type="button"
          onClick={onClose}
        >
          ×
        </button>

        <h2>
          {mode === "login"
            ? "Login"
            : mode ===
                "register"
              ? "Create account"
              : "Forgot Password"}
        </h2>

        {mode ===
          "forgot" && (
          <p>
            Enter your registered
            email address. We will
            send you a password reset
            link.
          </p>
        )}

        <form
          onSubmit={submit}
        >
          {mode ===
            "register" && (
            <>
              <input
                placeholder="Name"
                value={
                  form.name
                }
                onChange={(e) =>
                  change(
                    "name",
                    e.target
                      .value
                  )
                }
                required
              />

              <input
                placeholder="Country"
                value={
                  form.country
                }
                onChange={(e) =>
                  change(
                    "country",
                    e.target
                      .value
                  )
                }
                required
              />

              <input
                placeholder="Pincode"
                value={
                  form.pincode
                }
                onChange={(e) =>
                  change(
                    "pincode",
                    e.target
                      .value
                  )
                }
                required
              />

              <input
                placeholder="Phone"
                value={
                  form.phone
                }
                onChange={(e) =>
                  change(
                    "phone",
                    e.target
                      .value
                  )
                }
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={
              form.email
            }
            onChange={(e) =>
              change(
                "email",
                e.target.value
              )
            }
            required
          />

          {mode !==
            "forgot" && (
            <input
              type="password"
              placeholder="Password"
              value={
                form.password
              }
              onChange={(e) =>
                change(
                  "password",
                  e.target
                    .value
                )
              }
              required
            />
          )}

          <button
            className="primary"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : mode ===
                  "login"
                ? "Login"
                : mode ===
                    "register"
                  ? "Register"
                  : "Send Reset Link"}
          </button>
        </form>

        {msg && (
          <p>{msg}</p>
        )}

        {/* Forgot Password */}
        {mode ===
          "login" && (
          <button
            type="button"
            className="linkBtn"
            onClick={() =>
              switchMode(
                "forgot"
              )
            }
          >
            Forgot Password?
          </button>
        )}

        {/* Login / Register switching */}
        {mode !==
          "forgot" && (
          <button
            type="button"
            className="linkBtn"
            onClick={() =>
              switchMode(
                mode ===
                  "login"
                  ? "register"
                  : "login"
              )
            }
          >
            {mode ===
            "login"
              ? "No account? Register"
              : "Already have account? Login"}
          </button>
        )}

        {/* Forgot → Login */}
        {mode ===
          "forgot" && (
          <button
            type="button"
            className="linkBtn"
            onClick={() =>
              switchMode(
                "login"
              )
            }
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
}