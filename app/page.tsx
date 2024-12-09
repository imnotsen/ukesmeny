import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/toggle-darkmode";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen min-w-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold text-center">
          Velkommen til Ukesmeny
        </h1>
        <ModeToggle />

        <div className="flex flex-row items-center gap-5 justify-center sm:items-center flex-wrap w-100">
          <Link href="/ingredients">
            <Button>Legg til ingredienser</Button>
          </Link>
          <Link href="/recipes">
            <Button>Legg til oppskrift</Button>
          </Link>
          <Link href="/shoppinglist">
            <Button>Handleliste</Button>
          </Link>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </div>
  );
}
