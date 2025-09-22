"use client";

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";

const orderSchema = z.object({
  artist: z.string().min(2),
  serviceType: z.string(),
  style: z.string(),
  rhythm: z.string(),
  objective: z.string(),
  description: z.string().min(10),
});

type OrderFormData = z.infer<typeof orderSchema>;

export function OrderForm() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: { artist: "", serviceType: "", style: "", rhythm: "", objective: "", description: "" },
  });

  const onSubmit = async (values: OrderFormData) => {
    if (!user) {
      toast({ title: "Login necessário", variant: "destructive" });
      return;
    }

    try {
      const res = await fetch("/api/summarize-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      toast({ title: "Resumo Gerado!", description: data.summary });
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao criar resumo", variant: "destructive" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="artist"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Artista/Banda</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
