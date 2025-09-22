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
import { LogIn, LogOut, Save, Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useEffect, useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { useAuth, Profile } from "@/context/auth-context";
import { Skeleton } from "./ui/skeleton";
import { AppleIcon } from "./icons/apple-icon";

const profileSchema = z.object({
  fullName: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  artistName: z.string().min(2, "O nome artístico deve ter pelo menos 2 caracteres."),
  bio: z.string().max(280, "A biografia deve ter no máximo 280 caracteres.").optional().or(z.literal('')),
  preferredStyle: z.string().optional().or(z.literal('')),
  preferredRhythm: z.string().optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const LoggedOutView = ({ onGoogleLogin, onAppleLogin }: { onGoogleLogin: () => void; onAppleLogin: () => void; }) => (
  <Card>
    <CardHeader>
      <CardTitle>Conecte-se</CardTitle>
      <CardDescription>Faça login para criar seu perfil de artista e agilizar seus pedidos.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col gap-4">
        <Button onClick={onGoogleLogin} size="lg">
          <LogIn className="mr-2" /> Entrar com Google
        </Button>
        <Button onClick={onAppleLogin} size="lg" variant="outline">
          <AppleIcon className="mr-2 h-5 w-5" /> Entrar com Apple
        </Button>
      </div>
    </CardContent>
  </Card>
);

const ProfileSkeleton = () => (
  <div className="space-y-8">
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full max-w-sm" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-20 w-full" />
        </div>
      </CardContent>
    </Card>
    <Skeleton className="h-11 w-full" />
  </div>
);

export function ProfileForm() {
  const { user, userProfile, loading, signInWithGoogle, signInWithApple, signOut, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isAiPending] = useTransition();

  const form = useForm<ProfileFormData & { email: string }>({
    resolver: zodResolver(profileSchema.extend({ email: z.string().email() })),
    defaultValues: {
      fullName: "",
      artistName: "",
      email: "",
      bio: "",
      preferredStyle: "",
      preferredRhythm: ""
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        fullName: userProfile.fullName || '',
        artistName: userProfile.artistName || '',
        email: userProfile.email || '',
        bio: userProfile.bio || '',
        preferredStyle: userProfile.preferredStyle || '',
        preferredRhythm: userProfile.preferredRhythm || '',
      });
    }
  }, [userProfile, form]);

  const handleGenerateBio = () => {
    toast({
      title: "Funcionalidade de IA Indisponível",
      description: "A geração automática de biografia foi desativada temporariamente.",
      variant: "destructive",
    });
  };

  async function onSubmit(values: ProfileFormData) {
    if (!user || !userProfile) return;

    try {
      const profileData: Partial<Profile> = {
        ...userProfile,
        ...values,
      };
      await updateProfile(profileData);
      toast({
        title: "Perfil Atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar suas informações. Tente novamente.",
        variant: "destructive"
      });
    }
  }

  if (loading) return <ProfileSkeleton />;
  if (!user) return <LoggedOutView onGoogleLogin={signInWithGoogle} onAppleLogin={signInWithApple} />;

  return (
    <div className="space-y-12">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Informações Públicas</CardTitle>
              <CardDescription>Estes dados podem ser visíveis em projetos colaborativos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="artistName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Artístico / Banda</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Os Cantores Ungidos" {...field} />
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
                    <div className="flex items-center justify-between">
                      <FormLabel>Biografia Curta</FormLabel>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleGenerateBio}
                        disabled
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Gerar com IA (Indisponível)
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="Fale-nos um pouco sobre sua jornada musical e seu ministério."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações Privadas</CardTitle>
              <CardDescription>Usaremos estes dados para os seus pedidos. Eles não serão exibidos publicamente.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: João da Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço de E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="voce@exemplo.com" {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferências Musicais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="preferredStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estilo Principal</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione seu estilo preferido" />
                          </SelectTrigger>
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
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="preferredRhythm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ritmo / Andamento</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione seu ritmo preferido" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="calmo">Calmo / Lento</SelectItem>
                          <SelectItem value="moderado">Moderado</SelectItem>
                          <SelectItem value="agitado">Agitado / Rápido</SelectItem>
                          <SelectItem value="sebene">Sebene / Dendera</SelectItem>
                          <SelectItem value="pagode">Pagode / Samba</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Salvar Informações
          </Button>
        </form>
      </Form>
    </div>
  );
}
