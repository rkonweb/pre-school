import { ReactNode } from "react";

export default function AccountsLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { slug: string };
}) {
  return <>{children}</>;
}
