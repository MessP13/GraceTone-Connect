"use client";

import * as React from "react";
import { collection, query, onSnapshot, orderBy, Timestamp, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Mail, MessageCircle, Loader2, Archive, AlertTriangle, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast";
import { summarizeOrder, SummarizeOrderInput } from "@/ai/flows/summarize-order-flow";
import { useState, useTransition } from "react";


interface Order {
    id: string;
    artist: string;
    contact: string;
    serviceType: string;
    description: string;
    style: string;
    rhythm: string;
    objective: string;
    status: string;
    createdAt: Timestamp;
}

const statusVariantMap: { [key: string]: "default" | "secondary" | "outline" | "destructive" } = {
  "Novo": "default",
  "Em Análise": "secondary",
  "Contactado": "outline",
  "Arquivado": "destructive",
};

const serviceTypeMap: { [key: string]: string } = {
    "creation": "Criação",
    "recreation": "Re-Criação",
    "instrumental": "Instrumental",
    "production": "Produção Completa",
}

const objectiveMap: { [key: string]: string } = {
    "personal": "Uso Pessoal",
    "church": "Igreja / Ministério",
    "commercial": "Comercial",
}

const formatPhoneNumberForWhatsApp = (phone: string) => {
    return phone.replace(/\D/g, '');
}

const SummaryDialog = ({ summary, isLoading }: { summary: string | null, isLoading: boolean }) => (
    <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Resumo do Pedido (IA)
            </AlertDialogTitle>
            <AlertDialogDescription>
                {isLoading ? (
                    <div className="flex justify-center items-center h-24">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : (
                    <div
                        className="prose prose-sm dark:prose-invert text-left max-h-[60vh] overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: summary ? summary.replace(/\n/g, '<br />') : 'Nenhum resumo gerado.' }}
                    />
                )}
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel>Fechar</AlertDialogCancel>
        </AlertDialogFooter>
    </AlertDialogContent>
);


export default function OrdersPage() {
    const [orders, setOrders] = React.useState<Order[]>([]);
    const [loading, setLoading] = React.useState(true);
    const { userProfile, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isAiPending, startAiTransition] = useTransition();
    const [summary, setSummary] = useState<string | null>(null);
    const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);

    React.useEffect(() => {
        if (!authLoading) {
            if (!userProfile || (userProfile.role !== 'staff' && userProfile.role !== 'admin')) {
                router.push('/');
            }
        }
    }, [userProfile, authLoading, router]);

    React.useEffect(() => {
        if (userProfile && (userProfile.role === 'staff' || userProfile.role === 'admin')) {
            const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const ordersData: Order[] = [];
                querySnapshot.forEach((doc) => {
                    ordersData.push({ id: doc.id, ...doc.data() } as Order);
                });
                setOrders(ordersData);
                setLoading(false);
            }, (error) => {
                console.error("Error fetching orders:", error);
                setLoading(false);
            });

            return () => unsubscribe();
        }
    }, [userProfile]);
    
    const handleGenerateSummary = (order: Order) => {
        setSummary(null);
        setIsSummaryDialogOpen(true);
        startAiTransition(async () => {
            try {
                const input: SummarizeOrderInput = {
                    artist: order.artist,
                    serviceType: serviceTypeMap[order.serviceType] || order.serviceType,
                    style: order.style,
                    rhythm: order.rhythm,
                    objective: objectiveMap[order.objective] || order.objective,
                    description: order.description,
                };
                const result = await summarizeOrder(input);
                setSummary(result.summary);
            } catch (error) {
                console.error("Error generating summary:", error);
                setSummary("Ocorreu um erro ao gerar o resumo. Tente novamente.");
            }
        });
    };

    const handleArchiveOrder = async (orderId: string) => {
        const orderRef = doc(db, 'orders', orderId);
        try {
            await updateDoc(orderRef, { status: 'Arquivado' });
            toast({
                title: "Pedido Arquivado",
                description: "O pedido foi movido para os arquivados.",
            });
        } catch (error) {
            console.error("Error archiving order:", error);
            toast({
                title: "Erro ao Arquivar",
                description: "Não foi possível arquivar o pedido. Tente novamente.",
                variant: "destructive",
            });
        }
    };
    
    const activeOrders = orders.filter(order => order.status !== 'Arquivado');


    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!userProfile || (userProfile.role !== 'staff' && userProfile.role !== 'admin')) {
        return null;
    }

  return (
    <div className="container mx-auto py-16 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="font-headline text-3xl md:text-4xl font-bold">
          Painel de Pedidos
        </h1>
        <p className="mt-3 text-muted-foreground">
          Gerencie aqui todas as solicitações de projetos musicais.
        </p>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Artista</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeOrders.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                        Nenhum pedido ativo encontrado.
                    </TableCell>
                </TableRow>
            ) : (
                activeOrders.map((order) => (
                <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.artist}</TableCell>
                    <TableCell>{serviceTypeMap[order.serviceType] || order.serviceType}</TableCell>
                    <TableCell>{order.createdAt?.toDate().toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                    <Badge variant={statusVariantMap[order.status] || 'default'}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleGenerateSummary(order)}>
                        <Sparkles className="h-4 w-4" />
                        <span className="sr-only">Resumir com IA</span>
                    </Button>
                    <Dialog>
                        <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver Detalhes</span>
                        </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Pedido de <span className="font-bold">{order.artist}</span></DialogTitle>
                            <DialogDescription>
                            ID do Pedido: {order.id}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <p className="text-sm font-medium text-right col-span-1">Contato</p>
                                <p className="col-span-3 text-sm">{order.contact}</p>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <p className="text-sm font-medium text-right col-span-1">Serviço</p>
                                <p className="col-span-3 text-sm">{serviceTypeMap[order.serviceType] || order.serviceType}</p>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <p className="text-sm font-medium text-right col-span-1">Estilo</p>
                                <p className="col-span-3 text-sm">{order.style}</p>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <p className="text-sm font-medium text-right col-span-1">Ritmo</p>
                                <p className="col-span-3 text-sm">{order.rhythm}</p>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <p className="text-sm font-medium text-right col-span-1">Objetivo</p>
                                <p className="col-span-3 text-sm">{objectiveMap[order.objective] || order.objective}</p>
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                            <p className="text-sm font-medium text-right col-span-1 pt-1">Descrição</p>
                            <p className="col-span-3 text-sm bg-muted/50 p-2 rounded-md">{order.description}</p>
                            </div>
                        </div>
                        <DialogFooter className="sm:justify-between gap-2">
                            <div>
                            {order.contact.includes('@') ? (
                                <Button asChild>
                                    <a href={`mailto:${order.contact}?subject=Sobre seu pedido GraceTone: ${order.id}`}>
                                        <Mail className="mr-2" /> Entrar em Contato
                                    </a>
                                </Button>
                            ) : (
                                <Button asChild>
                                    <a href={`https://wa.me/${formatPhoneNumberForWhatsApp(order.contact)}`} target="_blank" rel="noopener noreferrer">
                                    <MessageCircle className="mr-2" /> Chamar no WhatsApp
                                    </a>
                                </Button>
                            )}
                            </div>
                            <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Fechar
                            </Button>
                            </DialogClose>
                        </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                                <Archive className="h-4 w-4" />
                                <span className="sr-only">Arquivar Pedido</span>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-6 w-6 text-primary" />
                                Arquivar este pedido?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação irá mover o pedido de <span className="font-medium">{order.artist}</span> para os arquivados. Ele não aparecerá mais na lista principal, mas não será eliminado permanentemente.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => handleArchiveOrder(order.id)}
                            >
                                Sim, arquivar pedido
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
       <AlertDialog open={isSummaryDialogOpen} onOpenChange={setIsSummaryDialogOpen}>
          <SummaryDialog summary={summary} isLoading={isAiPending} />
      </AlertDialog>
    </div>
  );
}
