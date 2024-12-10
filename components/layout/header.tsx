import { ModeToggle } from "../ui/toggle-darkmode";

export default function Header() {
  return (
    <header className="p-2 flex justify-between items-center sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-border">
      <div>
        <h1 className="text-2xl">Ukesmeny</h1>
      </div>
      <div>
        <ModeToggle />
      </div>
    </header>
  );
}
