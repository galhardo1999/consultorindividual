import { ShellAplicacao } from "@/components/ShellAplicacao";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ShellAplicacao>{children}</ShellAplicacao>;
}
