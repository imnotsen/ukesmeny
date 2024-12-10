// import LogoutButton from "../logout-button";
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
} from "../ui/navigation-menu";
import { ModeToggle } from "../ui/toggle-darkmode";

export default function Header() {
  const pathname = usePathname();

  const shouldShowMenu = pathname !== "/login" && pathname !== "/error";

  return (
    <header className="p-2 flex justify-between items-center sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-border">
      <div className="mr-4 hidden md:flex">
        {shouldShowMenu && (
          <NavigationMenu className="flex items-center gap-4 text-sm xl:gap-6">
            <NavigationMenuItem>
              <Link href="/" legacyBehavior passHref>
                <NavigationMenuLink>Home</NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/ingredients" legacyBehavior passHref>
                <NavigationMenuLink>Ingredienser</NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/recipes" legacyBehavior passHref>
                <NavigationMenuLink>Oppskrifter</NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/shoppinglist" legacyBehavior passHref>
                <NavigationMenuLink>Handleliste</NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenu>
        )}
      </div>
      <div>
        <ModeToggle />
        {/* <LogoutButton /> */}
      </div>
    </header>
  );
}
