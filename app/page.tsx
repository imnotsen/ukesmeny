import PageLayout from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <PageLayout>
      <h1 className="text-4xl font-bold text-center">Velkommen til Ukesmeny</h1>

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
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </PageLayout>
  );
}
