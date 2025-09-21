import { Music2, Youtube, Instagram } from "lucide-react";
import Link from "next/link";
import { TikTokIcon } from "@/components/icons/tiktok-icon";

export function AppFooter() {
  return (
    <footer className="border-t bg-background/80">
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Music2 className="h-6 w-6 text-primary" />
            <span className="font-headline text-xl font-bold">GraceTone Connect</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} GraceTone Connect. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="https://instagram.com/gracetone_mz" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram className="h-5 w-5 hover:text-primary transition-colors" />
            </Link>
            <Link href="https://youtube.com/@gracetonebymp?si=OsAoMxDfj7dq_gFo" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <Youtube className="h-5 w-5 hover:text-primary transition-colors" />
            </Link>
            <Link href="https://tiktok.com/@gracetonemz" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <TikTokIcon className="h-4 w-4 hover:text-primary transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
