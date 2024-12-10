"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "./actions";

export default function LoginPage() {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await login(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Email:</label>
      <Input id="email" name="email" type="email" required />
      <label htmlFor="password">Password:</label>
      <Input id="password" name="password" type="password" required />
      <Button type="submit">Log in</Button>
    </form>
  );
}
