
"use client"

import { ProfileForm } from "@/components/profile-form";
import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { loading } = useAuth();
  
  return (
    <div className="container mx-auto max-w-2xl py-16 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="font-headline text-3xl md:text-4xl font-bold">
          Seu Perfil de Artista
        </h1>
        <p className="mt-3 text-muted-foreground">
          {`Crie ou atualize seu perfil para se conectar com a GraceTone.`}
        </p>
      </div>
      {loading ? (
        <div className="flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <ProfileForm />
      )}
    </div>
  );
}
