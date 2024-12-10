// import LogoutButton from "../logout-button";
import { NavigationMenu } from "@radix-ui/react-navigation-menu";
import Link from "next/link";
import { NavigationMenuItem, NavigationMenuLink } from "../ui/navigation-menu";
import { ModeToggle } from "../ui/toggle-darkmode";

export default function Header() {
  return (
    <header className="p-2 flex justify-between items-center sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-border">
      <div className="mr-4 hidden md:flex">
        <NavigationMenu className="flex items-center gap-4 text-sm xl:gap-6">
          <NavigationMenuItem>
            <Link href="/" legacyBehavior passHref>
              <NavigationMenuLink className="text-white">
                Home
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/ingredients" legacyBehavior passHref>
              <NavigationMenuLink className="text-white">
                Ingredienser
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/recipes" legacyBehavior passHref>
              <NavigationMenuLink className="text-white">
                Oppskrifter
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/shoppinglist" legacyBehavior passHref>
              <NavigationMenuLink className="text-white">
                Handleliste
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenu>
      </div>
      <div>
        <ModeToggle />
        {/* <LogoutButton /> */}
      </div>
    </header>
  );
}
