"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Header() {
  const pathname = usePathname();
  return (
    <header className="flex w-full gap-2 border-b bg-white px-6 py-4 dark:bg-black">
      <Link
        id="back"
        className="rounded-md bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800"
        style={{
          display: pathname === "/" ? "none" : "flex",
        }}
        href=".."
      >
        {`<`}
      </Link>
      <h1 className="text-xl font-bold">Friend Zone Travel Planner</h1>
    </header>
  );
}

export default Header;
