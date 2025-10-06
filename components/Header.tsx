import React from "react";
import { Button } from "./ui/button";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { ModeToggle } from "./ModeToggle";

function Header() {
  return (
    <div className="w-full h-16 bg-white dark:bg-zinc-900  bg-zinc-100 shadow flex justify-between items-center px-4">
      {/* logo */}
      <div className="w-10 h-10 text-2xl">Logo</div>

      <div className="flex flex-row gap-3">
        {/* Theme Toggler */}
        <ModeToggle />
        {/* sign in /sign up button */}
        <SignedOut>
          <SignInButton>
            <Button variant={"default"} className="cursor-pointer">Sign In</Button>
          </SignInButton>
          <SignUpButton>
            <Button variant={"outline"} className="cursor-pointer">Sign Up</Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
}

export default Header;
