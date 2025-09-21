import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Mail, Instagram, Youtube, Music } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Separator } from "@/components/ui/separator";
import { TikTokIcon } from "@/components/icons/tiktok-icon";

const heroImage = PlaceHolderImages.find(p => p.id === 'hero');

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full h-[70vh] min-h-[500px] flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-black/50 z-10" />
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="relative z-20 container mx-auto px-4 md:px-6 animate-fade-in-up">
          <div className="flex justify-center mb-4">
            <Sparkles className="h-12 w-12 text-primary" />
          </div>
          <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight text-background">
            Criando Sons Divinos para o Seu Ministério
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-background/90">
            Produção de música gospel para elevar sua mensagem e inspirar almas.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg" className="font-bold">
              <Link href="/order">
                Comece um Projeto <ArrowRight className="ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/#showcase">Nosso Trabalho</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Work Showcase Section */}
      <section id="showcase" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">
              Nossas Obras de Graça
            </h2>
            <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
              Ouça os sons que criamos com paixão e propósito.
            </p>
          </div>

          <div className="space-y-16">
            <div>
                <h3 className="font-headline text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
                    <Music className="h-6 w-6 text-primary"/>
                    Originais GraceTone
                </h3>
                <div className="aspect-video max-w-4xl mx-auto">
                <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/pUGeX2tP-bY?si=FK6cU1tbt_0N3NV6" 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    referrerPolicy="strict-origin-when-cross-origin" 
                    allowFullScreen
                    className="rounded-lg shadow-lg">
                </iframe>
                </div>
            </div>

            <Separator className="my-8" />
            
            <div>
                 <h3 className="font-headline text-2xl font-bold mb-8 text-center">
                    Produzido pela GraceTone
                </h3>
                <div className="aspect-video max-w-4xl mx-auto">
                <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/cnfbNmn6uIg?si=Q-GnzDaW4Bx2koRg" 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    referrerPolicy="strict-origin-when-cross-origin" 
                    allowFullScreen
                    className="rounded-lg shadow-lg">
                </iframe>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-16 md:py-24 bg-secondary/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">
              Sobre Nós
            </h2>
          </div>
          <div className="max-w-3xl mx-auto text-center">
            <p className="mb-8 text-muted-foreground">
              Bem-vindos ao canal oficial da GraceTone! Aqui você encontrará um refúgio de música gospel e cristã que inspira, fortalece e conecta corações com a mensagem de Deus. Somos a GraceTone, dedicados a criar canções que elevam a alma e celebram a fé inabalável em Jesus. Através das nossas letras e melodias, buscamos compartilhar verdades eternas sobre a graça, fidelidade e amor de Deus.
            </p>
            <p className="mb-10 font-semibold">
              Inscreva-se no canal e ative o sininho para não perder nenhum lançamento! Junte-se à nossa comunidade para louvar, adorar e ser edificado por canções que tocam o coração e fortalecem o espírito.
            </p>
            <div className="flex flex-col items-center gap-6">
                <h3 className="font-headline text-2xl font-bold">Entre em Contacto</h3>
                <a href="mailto:gracetonestudios@gmail.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                    <Mail className="h-5 w-5" />
                    <span>gracetonestudios@gmail.com</span>
                </a>
                <div className="flex items-center gap-6 mt-4">
                    <Link href="https://instagram.com/gracetone_mz" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                        <Instagram className="h-7 w-7 hover:text-primary transition-colors" />
                    </Link>
                    <Link href="https://youtube.com/@gracetonebymp?si=OsAoMxDfj7dq_gFo" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                        <Youtube className="h-7 w-7 hover:text-primary transition-colors" />
                    </Link>
                    <Link href="https://tiktok.com/@gracetonemz" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                        <TikTokIcon className="h-6 w-6 hover:text-primary transition-colors" />
                    </Link>
                </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
