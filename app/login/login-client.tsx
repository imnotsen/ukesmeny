"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "./actions";

export default function LoginPageClient() {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await login(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Email:</label>
      <Input className="mb-1" id="email" name="email" type="email" required />
      <label htmlFor="password">Password:</label>
      <Input
        className="mb-2"
        id="password"
        name="password"
        type="password"
        required
      />
      <div className="flex justify-center">
        <Button className="mb-1 mx-auto" type="submit">
          Submit
        </Button>
      </div>
    </form>
  );
}
