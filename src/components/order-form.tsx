// src/components/order-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Validação do formulário
const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  contact: z.string().min(5, "Por favor, insira um contato válido."),
  serviceType: z.enum(["creation", "recreation", "instrumental", "production"], {
    errorMap: () => ({ message: "Por favor, selecione o tipo de serviço." }),
  }),
  description: z.string().min(10, "Por favor, forneça uma breve descrição.").max(500, "A descrição é muito longa."),
  style: z.string({ required_error: "Por favor, selecione um estilo." }).min(1, "Por favor, selecione um estilo."),
  rhythm: z.string({ required_error: "Por favor, selecione um ritmo." }).min(1, "Por favor, selecione um ritmo."),
  objective: z.enum(["personal", "church", "commercial"], {
    errorMap: () => ({ message: "Por favor, selecione um objetivo." }),
  }),
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

  // Preencher dados do usuário
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
      toast({
        title: "Login Necessário",
        description: "Por favor, faça login para enviar um pedido.",
        variant: "destructive",
      });
      router.push('/profile');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "orders"), {
        ...values,
        userId: user.uid,
        artist: values.name,
        status: "Novo",
        createdAt: serverTimestamp(),
      });
      toast({
        title: "Pedido Enviado com Sucesso!",
        description: "Obrigado! Sua solicitação foi recebida e entraremos em contato em breve.",
      });
      form.reset();
    } catch(error) {
      console.error("Error creating order:", error);
      toast({
        title: "Erro ao Enviar Pedido",
        description: "Houve um problema ao salvar seu pedido. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return <p>Carregando formulário...</p>;
  }

  if (!user) {
    return (
      <div className="text-center p-8 border rounded-lg bg-card">
        <h2 className="text-2xl font-bold mb-4">Faça Login para Continuar</h2>
        <p className="mb-6 text-muted-foreground">Você precisa estar conectado para fazer um pedido.</p>
        <Button onClick={() => router.push('/profile')}>Ir para a Página de Login</Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo do Artista/Banda</FormLabel>
              <FormControl>
                <Input placeholder="Ex: João da Silva ou Banda Som Celestial" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seu Melhor Contato</FormLabel>
              <FormControl>
                <Input placeholder="E-mail ou WhatsApp" {...field} />
              </FormControl>
              <FormDescription>
                Informe o meio pelo qual prefere ser contatado para darmos início ao seu projeto.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="serviceType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Qual serviço você precisa?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl><RadioGroupItem value="creation" /></FormControl>
                    <FormLabel className="font-normal">Criação (Música totalmente nova, do zero)</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl><RadioGroupItem value="recreation" /></FormControl>
                    <FormLabel className="font-normal">Re-Criação (Baseado em inspiração)</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl><RadioGroupItem value="instrumental" /></FormControl>
                    <FormLabel className="font-normal">Instrumental (Beat ou arranjo)</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl><RadioGroupItem value="production" /></FormControl>
                    <FormLabel className="font-normal">Produção Completa (Você já tem letra/melodia)</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descreva Sua Visão</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Conte-nos sobre a mensagem da música, artistas de referência, e qualquer detalhe."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="style"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estilo Musical Principal</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Selecione um estilo" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="adoracao">Adoração / Worship</SelectItem>
                    <SelectItem value="louvor-congregacional">Louvor Congregacional</SelectItem>
                    <SelectItem value="pentecostal">Pentecostal / Corinho de Fogo</SelectItem>
                    <SelectItem value="pop-gospel">Pop Gospel</SelectItem>
                    <SelectItem value="rock-gospel">Rock Gospel</SelectItem>
                    <SelectItem value="rap-gospel">Rap / Hip-Hop Gospel</SelectItem>
                    <SelectItem value="sertanejo-gospel">Sertanejo Gospel</SelectItem>
                    <SelectItem value="afrobeat-gospel">Afrobeat Gospel</SelectItem>
                    <SelectItem value="kizomba-gospel">Kizomba Gospel</SelectItem>
                    <SelectItem value="marrabenta-gospel">Marrabenta Gospel</SelectItem>
                    <SelectItem value="outro">Outro (especificar na descrição)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rhythm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ritmo / Andamento</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Selecione um ritmo" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="calmo">Calmo / Lento</SelectItem>
                    <SelectItem value="moderado">Moderado</SelectItem>
                    <SelectItem value="agitado">Agitado / Rápido</SelectItem>
                    <SelectItem value="sebene">Sebene / Dendera</SelectItem>
                    <SelectItem value="pagode">Pagode / Samba</SelectItem>
                    <SelectItem value="outro">Outro (especificar na descrição)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="objective"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Qual o objetivo da música?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl><RadioGroupItem value="personal" /></FormControl>
                    <FormLabel className="font-normal">Uso Pessoal</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl><RadioGroupItem value="church" /></FormControl>
                    <FormLabel className="font-normal">Igreja / Comunidade</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl><RadioGroupItem value="commercial" /></FormControl>
                    <FormLabel className="font-normal">Comercial / Divulgação</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Botão de envio */}
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "Enviando..." : "Enviar Pedido"}
          </Button>

          {/* Botão de IA desativada */}
          <Button type="button" variant="outline" disabled className="flex-1">
            Gerar Pedido com IA (Indisponível)
          </Button>
        </div>
      </form>
    </Form>
  );
}
