import ProtectedRoute from "@/components/ProtectedRoute";
import Header from "@/components/Header";

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute><Header />{children}</ProtectedRoute>;
}
