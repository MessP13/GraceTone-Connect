import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ErrorDetails {
    errorMessage: string;
    errorStack?: string;
    component: string;
    userId?: string;
    userEmail?: string;
}

export async function reportError(details: ErrorDetails) {
    try {
        await addDoc(collection(db, "error_reports"), {
            ...details,
            timestamp: serverTimestamp(),
        });
    } catch (error) {
        // Se o próprio relatório de erro falhar, registre no console.
        // Evite um loop infinito de relatórios de erro.
        console.error("Failed to report error to Firestore:", error);
        console.error("Original error details:", details);
    }
}
