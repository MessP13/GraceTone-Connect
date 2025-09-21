"use client";

import * as React from "react";
import { collection, query, onSnapshot, orderBy, Timestamp } from "firebase/firestore";
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
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ErrorReport {
    id: string;
    errorMessage: string;
    errorStack?: string;
    component: string;
    timestamp: Timestamp;
    userId?: string;
    userEmail?: string;
}

export default function ReportsPage() {
    const [reports, setReports] = React.useState<ErrorReport[]>([]);
    const [loading, setLoading] = React.useState(true);
    const { userProfile, loading: authLoading } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (!authLoading) {
            if (userProfile?.role !== 'admin') {
                router.push('/');
            }
        }
    }, [userProfile, authLoading, router]);

    React.useEffect(() => {
        if (userProfile?.role === 'admin') {
            const q = query(collection(db, "error_reports"), orderBy("timestamp", "desc"));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const reportsData: ErrorReport[] = [];
                querySnapshot.forEach((doc) => {
                    reportsData.push({ id: doc.id, ...doc.data() } as ErrorReport);
                });
                setReports(reportsData);
                setLoading(false);
            }, (error) => {
                console.error("Error fetching reports:", error);
                setLoading(false);
            });

            return () => unsubscribe();
        }
    }, [userProfile]);

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    if (userProfile?.role !== 'admin') {
        return null;
    }

    return (
        <div className="container mx-auto py-16 px-4 md:px-6">
            <div className="text-center mb-12">
                <h1 className="font-headline text-3xl md:text-4xl font-bold">
                    Relatórios de Erro
                </h1>
                <p className="mt-3 text-muted-foreground">
                    Monitorize aqui os erros que ocorrem na aplicação.
                </p>
            </div>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Componente</TableHead>
                            <TableHead>Mensagem</TableHead>
                            <TableHead>Usuário</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reports.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">
                                    Nenhum relatório de erro encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            reports.map((report) => (
                                <TableRow key={report.id}>
                                    <TableCell>
                                        {report.timestamp?.toDate().toLocaleString('pt-BR') || 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{report.component}</Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">{report.errorMessage}</TableCell>
                                    <TableCell>{report.userEmail || report.userId || 'Anônimo'}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
