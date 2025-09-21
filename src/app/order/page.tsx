import { OrderForm } from "@/components/order-form";

export default function OrderPage() {
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
