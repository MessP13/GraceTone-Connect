"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { OrderForm } from "@/components/order-form";
import { Button } from "@/components/ui/button";

export default function OrderPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // redireciona para a página de login ou mostra aviso
      router.push("/login"); // ou outra página de login
    }
  }, [user, loading, router]);

  if (loading) {
    return <p>Carregando...</p>; // opcional: spinner
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">Você precisa estar logado</h2>
        <p className="mb-6">Faça login para criar seu pedido.</p>
        <Button onClick={() => router.push("/login")}>Login</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-16 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="font-headline text-3xl md:text-4xl font-bold">
          Faça seu Pedido
        </h1>
        <p className="mt-3 text-muted-foreground">
          Vamos começar a criar sua obra-prima. Preencha o formulário abaixo.
        </p>
      </div>
      <OrderForm />
    </div>
  );
}
