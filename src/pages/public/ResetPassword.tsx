import {
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  resetPassword,
} from "../../api/authApi";

export default function ResetPassword() {
  const { token } =
    useParams();

  const navigate =
    useNavigate();

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [msg, setMsg] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const submit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setMsg("");

    if (!token) {
      setMsg(
        "Invalid reset link"
      );

      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setMsg(
        "Passwords do not match"
      );

      return;
    }

    try {
      setLoading(true);

      const { data } =
        await resetPassword(
          token,
          password,
          confirmPassword
        );

      setSuccess(true);

      setMsg(
        data.message ||
          "Password changed successfully"
      );
    } catch (err: any) {
      setMsg(
        err?.response?.data
          ?.message ||
          "Unable to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="loginPage">
      <form
        className="panel"
        onSubmit={submit}
      >
        <h1>
          Reset Password
        </h1>

        {!success ? (
          <>
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              required
            />

            <input
              type="password"
              placeholder="Confirm password"
              value={
                confirmPassword
              }
              onChange={(e) =>
                setConfirmPassword(
                  e.target
                    .value
                )
              }
              required
            />

            <button
              type="submit"
              className="primary"
              disabled={loading}
            >
              {loading
                ? "Changing..."
                : "Change Password"}
            </button>
          </>
        ) : (
          <button
            type="button"
            className="primary"
            onClick={() =>
              navigate("/")
            }
          >
            Go to Login
          </button>
        )}

        {msg && (
          <p>
            {msg}
          </p>
        )}
      </form>
    </main>
  );
}