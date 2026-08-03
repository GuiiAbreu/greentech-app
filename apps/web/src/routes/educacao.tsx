import { createFileRoute } from "@tanstack/react-router";
import { LayoutConsumer } from "@/components/layouts/LayoutConsumer";
import { LayoutFarmer } from "@/components/layouts/LayoutFarmer";
import { LayoutPublic } from "@/components/layouts/LayoutPublic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Leaf, Droplet, Recycle, Sprout } from "lucide-react";

export const Route = createFileRoute("/educacao")({ component: Page });

const contents = [
  { title: "Introdução à Agroecologia", category: "Agroecologia", icon: Leaf, desc: "Princípios para cultivar respeitando o meio ambiente." },
  { title: "Compostagem caseira", category: "Compostagem", icon: Recycle, desc: "Transforme restos orgânicos em adubo de qualidade." },
  { title: "Manejo Orgânico do solo", category: "Manejo Orgânico", icon: Sprout, desc: "Mantenha o solo saudável sem agrotóxicos." },
  { title: "Economia de água na lavoura", category: "Economia de Água", icon: Droplet, desc: "Técnicas simples para reduzir o consumo de água." },
  { title: "Controle biológico de pragas", category: "Manejo Orgânico", icon: Leaf, desc: "Use a natureza para proteger sua plantação." },
  { title: "Plantio direto e cobertura", category: "Agroecologia", icon: Sprout, desc: "Proteja o solo e aumente a produtividade." },
];

function Page() {
  const { user } = useAuth();
  const Wrap = !user ? LayoutPublic : user.role === "FARMER" ? LayoutFarmer : LayoutConsumer;
  return (
    <Wrap>
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold"><BookOpen className="h-6 w-6 text-primary" /> Educação no campo</h1>
        <p className="text-sm text-muted-foreground">Conteúdos para fortalecer a agricultura familiar.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contents.map((c) => (
          <Card key={c.title} className="p-5">
            <div className="mb-3 grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary">
              <c.icon className="h-6 w-6" />
            </div>
            <Badge variant="secondary" className="mb-2">{c.category}</Badge>
            <h3 className="font-semibold">{c.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
            <Button variant="outline" className="mt-4 w-full">Ler conteúdo</Button>
          </Card>
        ))}
      </div>
    </Wrap>
  );
}