import { useNavigate } from "react-router-dom";
import { RegisterForm } from "./form";

export function RegisterPage() {
  const navigate = useNavigate();

  return (
    <RegisterForm
      onSwitchToLogin={() => navigate("/auth/login", { replace: true })}
      onSuccess={() => {}}
    />
  );
}
