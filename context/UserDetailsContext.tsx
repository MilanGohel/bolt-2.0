import { createContext } from "react";

export interface UserDetails {
    id: string;
    name: string;
    email: string;
    image: string;
}

export const UserDetailsContext = createContext<{
  userDetails: UserDetails | undefined;
  setUserDetails: React.Dispatch<React.SetStateAction<UserDetails | undefined>>;
}>({
  userDetails: undefined,
  setUserDetails: () => {}
});