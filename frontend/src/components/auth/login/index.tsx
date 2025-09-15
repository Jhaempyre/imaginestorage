import { useNavigate } from "react-router";
import { LoginForm } from "./form";

export function LoginPage() {
  const navigate = useNavigate();
  return (
    <LoginForm
      onSwitchToRegister={() => navigate("/auth/register", { replace: true })}
      onSuccess={() => {}}
      // onSuccess={() => navigate("/", { replace: true })}
    />
  );
}
