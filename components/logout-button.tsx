"use client";
import { supabase } from "@/utils/supabase/supabase";
import { Button } from "./ui/button";

export default function LogoutButton() {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
      alert(`Error: ${error.message}`);
    } else {
      alert("Successfully logged out");
      window.location.href = "/login";
    }
  };

  return (
    <div>
      <Button onClick={handleLogout}>Logg ut</Button>
    </div>
  );
}
