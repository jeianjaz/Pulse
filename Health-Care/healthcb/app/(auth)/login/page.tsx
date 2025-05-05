import LoginForm from "@/components/Login";
import ProtectedRoute from "@/components/ProtectedRoute";
import BackgroundElements from "@/components/BackgroundElements";

export default function LoginPage() {
  return (
    <ProtectedRoute redirectIfAuthenticated={true}>
      <main className="min-h-screen bg-[#FFFFFF] relative overflow-hidden">
        <BackgroundElements />
        <LoginForm />
      </main>
    </ProtectedRoute>
  );
}