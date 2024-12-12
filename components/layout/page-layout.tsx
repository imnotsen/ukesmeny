import { ReactNode } from "react";
import Header from "./header";

interface PageLayoutProps {
  children: ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  return (
    <>
      <Header />
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-[calc(100vh-65px)] min-w-screen p-4 pb-5 gap-8 sm:p-12 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          {children}
        </main>
        <footer className="row-start-3 flex flex-wrap items-center justify-center">
          <p>© 2024 Ukesmeny</p>
        </footer>
      </div>
    </>
  );
}
