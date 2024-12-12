"use client";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "../ui/navigation-menu";
import { ModeToggle } from "../ui/toggle-darkmode";

export default function Header() {
  const pathname = usePathname();
  const shouldShowMenu = pathname !== "/login" && pathname !== "/error";

  const MenuItems = () => (
    <>
      <NavigationMenuItem className={navigationMenuTriggerStyle()}>
        <Link href="/" legacyBehavior passHref>
          <NavigationMenuLink>Home</NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
      <NavigationMenuItem className={navigationMenuTriggerStyle()}>
        <Link href="/ingredients" legacyBehavior passHref>
          <NavigationMenuLink>Ingredienser</NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
      <NavigationMenuItem className={navigationMenuTriggerStyle()}>
        <Link href="/recipes" legacyBehavior passHref>
          <NavigationMenuLink>Oppskrifter</NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
      <NavigationMenuItem className={navigationMenuTriggerStyle()}>
        <Link href="/shoppinglist" legacyBehavior passHref>
          <NavigationMenuLink>Handleliste</NavigationMenuLink>
        </Link>
      </NavigationMenuItem>
    </>
  );

  return (
    <header className="p-2 flex justify-between items-center sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-border">
      <div className="md:hidden">
        {shouldShowMenu && (
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Menu</DrawerTitle>
              </DrawerHeader>
              <div className="flex flex-col gap-4 p-4">
                <NavigationMenu className="flex flex-col gap-2">
                  <MenuItems />
                </NavigationMenu>
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </div>

      <div className="mr-4 hidden md:flex">
        {shouldShowMenu && (
          <NavigationMenu className="flex items-center gap-4 text-sm xl:gap-6">
            <MenuItems />
          </NavigationMenu>
        )}
      </div>

      <div>
        <ModeToggle />
      </div>
    </header>
  );
}
