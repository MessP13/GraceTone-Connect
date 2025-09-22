"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

const formSchema = z.object({
  name: z.string().min(2),
  contact: z.string().min(5),
  serviceType: z.enum(["creation","recreation","instrumental","production"]),
  description: z.string().min(10).max(500),
  style: z.string().min(1),
  rhythm: z.string().min(1),
  objective: z.enum(["personal","church","commercial"]),
});

export function OrderForm() {
  const { toast } = useToast();
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contact: "",
      description: "",
      style: "",
      rhythm: "",
      serviceType: "creation",
      objective: "personal",
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        name: userProfile.artistName || "",
        contact: userProfile.email || "",
        style: userProfile.preferredStyle || "",
        rhythm: userProfile.preferredRhythm || "",
      });
    }
  }, [userProfile]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "orders"), {
        ...data,
        userId: user?.uid,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Order sent successfully!" });
      form.reset();
      router.push("/thank-you");
    } catch (error) {
      console.error(error);
      toast({ title: "Error sending order.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Input {...form.register("name")} placeholder="Your Name" />
      <Input {...form.register("contact")} placeholder="Email or Phone" />
      
      <Select {...form.register("serviceType")}>
        <SelectTrigger>
          <SelectValue placeholder="Service Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="creation">Creation</SelectItem>
          <SelectItem value="recreation">Recreation</SelectItem>
          <SelectItem value="instrumental">Instrumental</SelectItem>
          <SelectItem value="production">Production</SelectItem>
        </SelectContent>
      </Select>

      <Textarea {...form.register("description")} placeholder="Description" />
      <Input {...form.register("style")} placeholder="Style" />
      <Input {...form.register("rhythm")} placeholder="Rhythm" />

      <RadioGroup {...form.register("objective")}>
        <RadioGroupItem value="personal" label="Personal" />
        <RadioGroupItem value="church" label="Church" />
        <RadioGroupItem value="commercial" label="Commercial" />
      </RadioGroup>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Order"}
      </Button>
    </form>
  );
}
