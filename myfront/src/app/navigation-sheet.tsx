import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";
import { foods, travelMenuItems } from "./components/navbar/config";

export const NavigationSheet = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent>
        

        <div className="mt-12 space-y-4 text-base">
          <Link href="#">Home</Link>

          <div>
            <div className="font-bold">Food</div>
            <ul className="pl-4 mt-2 ml-1 space-y-3 border-l">
              {foods.map((foodItem) => (
                <li key={foodItem.title}>
                  <Link href="#" className="flex items-center gap-2">
                    <foodItem.icon className="w-5 h-5 mr-2 text-muted-foreground" />
                    {foodItem.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="font-bold">Travel</div>
            <ul className="pl-4 mt-2 ml-1 space-y-3 border-l">
              {travelMenuItems.map((item) => (
                <li key={item.title}>
                  <Link href="#" className="flex items-center gap-2">
                    <item.icon className="w-5 h-5 mr-2 text-muted-foreground" />
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
