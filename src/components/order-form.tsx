// src/components/order-form.tsx
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

// Validação do formulário
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
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        name: userProfile.artistName || "",
        contact: userProfile.email || "",
        style: userProfile.preferredStyle || "",
        rhythm: userProfile.preferredRhythm || "",
        description: "",
        serviceType: undefined,
        objective: undefined,
      });
    }
  }, [userProfile, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ title: "Login Necessário", description: "Faça login para enviar um pedido.", variant: "destructive" });
      router.push('/profile');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db,"orders"),{
        ...values,
        userId: user.uid,
        status:"Novo",
        createdAt: serverTimestamp(),
      });
      toast({ title: "Pedido enviado!", description: "Obrigado! Entraremos em contato em breve." });
      form.reset();
    } catch(e) {
      console.error(e);
      toast({ title:"Erro", description:"Não foi possível enviar o pedido.", variant:"destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) return <p>Carregando...</p>;
  if (!user) return <div className="text-center p-8 border rounded-lg bg-card"><h2>Faça Login</h2><Button onClick={()=>router.push('/profile')}>Login</Button></div>;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div>
        <label>Nome</label>
        <Input {...form.register("name")} placeholder="Seu nome ou banda" />
        {form.formState.errors.name && <p>{form.formState.errors.name.message}</p>}
      </div>

      <div>
        <label>Contato</label>
        <Input {...form.register("contact")} placeholder="E-mail ou WhatsApp" />
        {form.formState.errors.contact && <p>{form.formState.errors.contact.message}</p>}
      </div>

      <div>
        <label>Tipo de Serviço</label>
        <RadioGroup onValueChange={form.setValue.bind(null,"serviceType")} defaultValue={form.getValues("serviceType")}>
          <RadioGroupItem value="creation" /> Criação
          <RadioGroupItem value="recreation" /> Re-Criação
          <RadioGroupItem value="instrumental" /> Instrumental
          <RadioGroupItem value="production" /> Produção
        </RadioGroup>
        {form.formState.errors.serviceType && <p>{form.formState.errors.serviceType.message}</p>}
      </div>

      <div>
        <label>Descrição</label>
        <Textarea {...form.register("description")} placeholder="Detalhes do pedido" />
        {form.formState.errors.description && <p>{form.formState.errors.description.message}</p>}
      </div>

      <div>
        <label>Estilo</label>
        <Select onValueChange={form.setValue.bind(null,"style")} defaultValue={form.getValues("style")}>
          <SelectTrigger><SelectValue placeholder="Escolha um estilo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="adoracao">Adoração</SelectItem>
            <SelectItem value="pop-gospel">Pop Gospel</SelectItem>
            <SelectItem value="rock-gospel">Rock Gospel</SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.style && <p>{form.formState.errors.style.message}</p>}
      </div>

      <div>
        <label>Ritmo</label>
        <Select onValueChange={form.setValue.bind(null,"rhythm")} defaultValue={form.getValues("rhythm")}>
          <SelectTrigger><SelectValue placeholder="Escolha um ritmo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="calmo">Calmo</SelectItem>
            <SelectItem value="moderado">Moderado</SelectItem>
            <SelectItem value="agitado">Agitado</SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.rhythm && <p>{form.formState.errors.rhythm.message}</p>}
      </div>

      <div>
        <label>Objetivo</label>
        <RadioGroup onValueChange={form.setValue.bind(null,"objective")} defaultValue={form.getValues("objective")}>
          <RadioGroupItem value="personal" /> Pessoal
          <RadioGroupItem value="church" /> Igreja
          <RadioGroupItem value="commercial" /> Comercial
        </RadioGroup>
        {form.formState.errors.objective && <p>{form.formState.errors.objective.message}</p>}
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Enviando..." : "Enviar Pedido"}</Button>
        <Button type="button" disabled variant="outline">IA (Indisponível)</Button>
      </div>
    </form>
  );
}
