import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
export interface SignInDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function SignInDialog({ isOpen, onOpenChange }: SignInDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold">
            Welcome to Bolt
          </DialogTitle>
          <DialogDescription className="text-base">
            Sign in to start building amazing apps with AI
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 py-4">
          <SignedOut>
            <SignInButton>
              <Button variant={"default"} className="cursor-pointer">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton>
              <Button variant={"outline"} className="cursor-pointer">
                Sign Up
              </Button>
            </SignUpButton>
          </SignedOut>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SignInDialog;
