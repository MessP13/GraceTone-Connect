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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import { useTransition, useEffect } from "react";
import { useAuth } from "@/context/auth-context";

const profileSchema = z.object({
  fullName: z.string().min(2),
  artistName: z.string().min(2),
  bio: z.string().max(280).optional(),
  preferredStyle: z.string().optional(),
  preferredRhythm: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { userProfile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isAiPending, startAiTransition] = useTransition();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      artistName: "",
      bio: "",
      preferredStyle: "",
      preferredRhythm: "",
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset(userProfile);
    }
  }, [userProfile, form]);

  const handleGenerateBio = () => {
    const { artistName, preferredStyle, preferredRhythm } = form.getValues();
    if (!artistName) {
      toast({
        title: "Nome Artístico Necessário",
        variant: "destructive",
      });
      return;
    }

    startAiTransition(async () => {
      try {
        const res = await fetch("/api/generate-bio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ artistName, preferredStyle, preferredRhythm }),
        });
        const data = await res.json();
        if (data.bio) {
          form.setValue("bio", data.bio);
          toast({ title: "Biografia Gerada!" });
        }
      } catch (err) {
        console.error(err);
        toast({
          title: "Erro na Geração",
          variant: "destructive",
        });
      }
    });
  };

  const onSubmit = async (values: ProfileFormData) => {
    try {
      await updateProfile(values);
      toast({ title: "Perfil Atualizado!" });
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="artistName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Artístico</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel>Biografia</FormLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateBio}
                  disabled={isAiPending}
                >
                  {isAiPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Gerar IA
                </Button>
              </div>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Salvar Alterações</Button>
      </form>
    </Form>
  );
}
