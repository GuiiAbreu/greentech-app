import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutPublic } from "@/components/layouts/LayoutPublic";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sprout, Users, Leaf, Heart, ShoppingBasket, Tractor } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "GreenTech — Conectando o campo à sua mesa" },
      {
        name: "description",
        content:
          "Compre produtos locais direto de agricultores familiares. Apoie a agricultura familiar com a GreenTech.",
      },
    ],
  }),
});

const benefits = [
  { icon: Sprout, title: "Venda direta", desc: "Sem atravessadores. Preço justo para todos." },
  { icon: Leaf, title: "Produtos locais", desc: "Frescos, da sua região, na sua mesa." },
  { icon: Users, title: "Agricultura familiar", desc: "Você apoia famílias do campo." },
  { icon: Heart, title: "Sustentabilidade", desc: "Menos transporte, mais respeito ao planeta." },
];

const featured = [
  { name: "Tomate Cereja Orgânico", price: "R$ 12,00", img: "tomate" },
  { name: "Alface Crespa", price: "R$ 4,50", img: "alface" },
  { name: "Ovos Caipira", price: "R$ 18,00", img: "ovos" },
  { name: "Queijo Coalho", price: "R$ 25,00", img: "queijo" },
];

function Index() {
  return (
    <LayoutPublic>
      <section className="bg-gradient-to-b from-primary/10 to-background">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl">
              Conectando o campo à <span className="text-primary">sua mesa</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Compre produtos locais diretamente de agricultores familiares.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/cadastro">
                <Button size="lg"><ShoppingBasket className="h-4 w-4" /> Comprar produtos</Button>
              </Link>
              <Link to="/cadastro">
                <Button size="lg" variant="outline"><Tractor className="h-4 w-4" /> Sou agricultor</Button>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {featured.slice(0, 4).map((f) => (
              <Card key={f.img} className="overflow-hidden p-0">
                <div className="aspect-square bg-muted">
                  <img
                    src={`https://picsum.photos/seed/${f.img}/400/400`}
                    alt={f.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="sobre" className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-2xl font-bold md:text-3xl">Por que a GreenTech?</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <Card key={b.title} className="p-6 text-center">
                <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                  <b.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">{b.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="produtos" className="bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-bold md:text-3xl">Produtos em destaque</h2>
          <p className="mt-1 text-muted-foreground">Direto do produtor para você.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((f) => (
              <Card key={f.name} className="overflow-hidden p-0">
                <div className="aspect-square bg-muted">
                  <img
                    src={`https://picsum.photos/seed/${f.img}/400/400`}
                    alt={f.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{f.name}</h3>
                  <p className="mt-1 text-lg font-bold text-primary">{f.price}</p>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/cadastro"><Button size="lg">Criar conta para comprar</Button></Link>
          </div>
        </div>
      </section>
    </LayoutPublic>
  );
}
