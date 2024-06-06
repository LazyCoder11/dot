import Button from "@/components/ui/Button";
import { db } from "@/lib/db";
import Image from "next/image";

export default async function Home() {

  await db.set("hello", "hello")

  return (
    <main className="flex justify-center items-center h-[100vh]">
      <Button variant={"ghost"}>Dashboard</Button>
    </main>
  );
}
