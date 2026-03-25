"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  BookOpen,
  FileText,
  FolderTree,
  Building2,
  CheckCircle2,
  Search,
  Mail,
  Lightbulb,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Tag,
  Clock,
  Shield,
  Sparkles,
} from "lucide-react";

const GUIDE_SECTIONS = [
  {
    id: "referentiels",
    title: "Structurer les référentiels",
    description: "Créez les catégories documentaires et les départements pour cadrer l&apos;organisation des dossiers.",
    icon: FolderTree,
    color: "text-blue-600",
    bg: "bg-blue-50",
    link: "/categories",
    linkLabel: "Accéder aux catégories",
    steps: [
      "Définissez les catégories documentaires (ex: Courrier, Rapports, Contrats)",
      "Créez les départements de votre organisation (ex: RH, Finance, Juridique)",
      "Associez chaque document à une catégorie et un département",
    ],
  },
  {
    id: "documents",
    title: "Enregistrer les documents",
    description: "Ajoutez les documents avec leur référence, date, statut et mode de stockage.",
    icon: FileText,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    link: "/documents",
    linkLabel: "Accéder aux documents",
    steps: [
      "Choisissez le mode d&apos;ajout : téléversement, lien externe ou saisie manuelle",
      "Renseignez les métadonnées : titre, référence, date, catégorie, département",
      "Prévisualisez le document avant validation",
    ],
  },
  {
    id: "validation",
    title: "Valider et archiver",
    description: "Contrôlez les pièces, passez au statut validé puis archivé pour finaliser le cycle.",
    icon: CheckCircle2,
    color: "text-amber-600",
    bg: "bg-amber-50",
    link: "/documents",
    linkLabel: "Gérer les documents",
    steps: [
      "Vérifiez les documents en statut &apos;Brouillon&apos;",
      "Validez les pièces conformes pour les rendre consultables",
      "Archivez les documents obsolètes pour l&apos;historique",
    ],
  },
] as const;

const NAVIGATION_SECTIONS = [
  {
    title: "Catégories documentaires",
    icon: Tag,
    description: "Organisez les familles documentaires, les types de dossiers et les logiques de classement.",
    href: "/categories",
    badge: "Référentiel",
    tips: ["Créez des catégories génériques puis affinez par sous-types", "Utilisez les modèles rapides pour gagner du temps"],
  },
  {
    title: "Départements",
    icon: Building2,
    description: "Structurez les services et rattachez chaque dossier à son entité organisationnelle.",
    href: "/departments",
    badge: "Organisation",
    tips: ["Créez les départements avant d&apos;ajouter des documents", "Chaque département peut avoir ses propres catégories privilégiées"],
  },
  {
    title: "Centre documentaire",
    icon: FileText,
    description: "Créez, téléversez, consultez, téléchargez, imprimez et archivez les documents officiels.",
    href: "/documents",
    badge: "Exploitation",
    tips: ["Utilisez la recherche avancée pour filtrer par statut, date ou type", "Activez/désactivez les filtres selon vos besoins"],
  },
] as const;

const FAQ_ITEMS = [
  {
    question: "Comment ajouter un nouveau document ?",
    answer: "Rendez-vous dans le Centre documentaire, cliquez sur &apos;Nouveau document&apos; et choisissez votre mode d&apos;ajout : téléversement direct (glisser-déposer), lien externe vers un fichier existant, ou saisie manuelle pour les documents physiques. Remplissez les métadonnées requises et validez.",
  },
  {
    question: "Quelle est la différence entre Brouillon, Validé et Archivé ?",
    answer: "&apos;Brouillon&apos; : document en cours de rédaction ou en attente de validation. &apos;Validé&apos; : document approuvé et consultable par tous les utilisateurs autorisés. &apos;Archivé&apos; : document conservé pour l&apos;historique mais marqué comme obsolète. Seuls les administrateurs peuvent changer le statut.",
  },
  {
    question: "Comment modifier une catégorie ou un département ?",
    answer: "Accédez aux pages Catégories ou Départements via le menu latéral. Cliquez sur l&apos;élément à modifier dans la liste, ou utilisez le menu d&apos;actions (trois points) puis &apos;Modifier&apos;. Vous pouvez changer le nom, la description et le statut actif/inactif.",
  },
  {
    question: "Puis-je désactiver un document sans le supprimer ?",
    answer: "Oui ! Utilisez le bouton Activer/Désactiver dans le menu d&apos;actions. Un document désactivé reste dans la base mais n&apos;apparaît plus dans les recherches par défaut. Vous pouvez le réactiver à tout moment. Cela préserve l&apos;historique tout en masquant temporairement.",
  },
  {
    question: "Comment exporter ou imprimer un document ?",
    answer: "Dans la liste des documents, cliquez sur &apos;Voir&apos; pour ouvrir le document. Les options Télécharger, Imprimer et Ouvrir sont disponibles dans la barre d&apos;actions de la prévisualisation. Les formats PDF s&apos;ouvrent directement dans le navigateur.",
  },
  {
    question: "Que faire si le téléversement échoue ?",
    answer: "Vérifiez d&apos;abord la taille du fichier (max 50Mo recommandé) et le format (PDF, DOCX, XLSX acceptés). Assurez-vous que l&apos;API backend est accessible. Si le problème persiste, videz le cache via les Paramètres ou contactez le support.",
  },
] as const;

const ASTUCES = [
  {
    icon: Sparkles,
    title: "Modèles rapides",
    content: "Utilisez les boutons de modèles rapides lors de la création pour pré-remplir automatiquement les champs nom et description. Gain de temps garanti !",
  },
  {
    icon: Search,
    title: "Recherche intelligente",
    content: "La recherche s&apos;effectue sur le titre, la référence et la description. Combinez-la avec les filtres de statut (Actif/Inactif) pour affiner rapidement.",
  },
  {
    icon: Shield,
    title: "Statut de visibilité",
    content: "Désactivez plutôt que supprimez ! Cela garde l&apos;historique intact tout en masquant aux utilisateurs. Réactivation en un clic si besoin.",
  },
  {
    icon: Clock,
    title: "Notifications",
    content: "Activez les notifications dans les Paramètres pour être alerté des nouveaux documents et validations. Disponible par email ou in-app.",
  },
] as const;

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState({ subject: "", message: "" });

  const handleSendFeedback = () => {
    if (!feedback.subject.trim() || !feedback.message.trim()) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    toast.success("Message envoyé", {
      description: "Nous vous répondrons dans les plus brefs délais.",
    });
    setFeedback({ subject: "", message: "" });
  };

  const filteredFaq = FAQ_ITEMS.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Centre d&apos;aide</h1>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Guide complet pour maîtriser la GED Pro : démarrage rapide, navigation métier, FAQ et bonnes pratiques.
        </p>
      </div>

      {/* Guide de démarrage - Cycle documentaire */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Guide de démarrage rapide</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Suivez ce parcours conseillé pour respecter le cahier des charges, la traçabilité et l&apos;archivage.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          {GUIDE_SECTIONS.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card key={section.id} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${section.bg.replace("bg-", "bg-").replace("50", "500")}`} />
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      Étape {index + 1}
                    </Badge>
                  </div>
                  <div className={`p-2 rounded-lg ${section.bg} w-fit`}>
                    <Icon className={`h-5 w-5 ${section.color}`} />
                  </div>
                  <CardTitle className="text-base pt-2">{section.title}</CardTitle>
                  <CardDescription className="text-xs">{section.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2 text-sm">
                    {section.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={section.link}>
                      {section.linkLabel}
                      <ArrowRight className="h-3 w-3 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <Separator />

      {/* Navigation métier */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Navigation métier principale</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Accès direct aux référentiels essentiels de la GED pour administrer les catégories, structurer les départements et gérer le fonds documentaire.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          {NAVIGATION_SECTIONS.map((nav) => {
            const Icon = nav.icon;
            return (
              <Card key={nav.title} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {nav.badge}
                    </Badge>
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-base pt-2">{nav.title}</CardTitle>
                  <CardDescription className="text-xs">{nav.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Astuces :</p>
                    <ul className="space-y-1">
                      {nav.tips.map((tip, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                          <Lightbulb className="h-3 w-3 shrink-0 mt-0.5" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button size="sm" className="w-full" asChild>
                    <Link href={nav.href}>
                      Accéder
                      <ArrowRight className="h-3 w-3 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <Separator />

      {/* FAQ */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Foire aux questions</h2>
        </div>

        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans la FAQ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredFaq.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {filteredFaq.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Aucune question trouvée pour &quot;{searchQuery}&quot;
          </div>
        )}
      </section>

      <Separator />

      {/* Astuces */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Astuces et bonnes pratiques</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {ASTUCES.map((astuce, index) => {
            const Icon = astuce.icon;
            return (
              <Card key={index} className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
                <CardHeader className="pb-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm">{astuce.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground leading-relaxed">{astuce.content}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <Separator />

      {/* Contact et Support */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Contact et support</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Envoyez-nous un message</CardTitle>
              <CardDescription>
                Une question, une suggestion ou un bug ? Nous sommes là pour vous aider.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Sujet"
                  value={feedback.subject}
                  onChange={(e) => setFeedback((p) => ({ ...p, subject: e.target.value }))}
                />
              </div>
              <Textarea
                placeholder="Décrivez votre question ou problème..."
                value={feedback.message}
                onChange={(e) => setFeedback((p) => ({ ...p, message: e.target.value }))}
                rows={4}
              />
              <Button onClick={handleSendFeedback} className="w-full">
                Envoyer le message
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Ressources utiles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/documents">
                    <FileText className="h-4 w-4 mr-2" />
                    Centre documentaire
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/settings">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Paramètres de l&apos;application
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <div className="text-center text-xs text-muted-foreground space-y-1 pt-4">
              <p>GED Pro v1.0.0 • Dernière mise à jour : 20 mars 2026</p>
              <p>© 2026 GED Pro. Tous droits réservés.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
