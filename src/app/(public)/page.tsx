import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const contentBlocks = await db.contentBlock.findMany();
  
  // Convert array to a key/value object
  const content = contentBlocks.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  const headline = content["hero_headline"] || "Solid wood, honestly made.";
  const subline = content["hero_subline"] || "Crafting furniture for generations.";
  const ctaText = content["hero_cta_text"] || "Explore the Collection";
  const ctaUrl = content["hero_cta_url"] || "/collections";
  const mediaUrl = content["hero_media_url"] || "";
  
  let pillars = [];
  try {
    if (content["why_solid_wood_pillars"]) {
      pillars = JSON.parse(content["why_solid_wood_pillars"]);
    }
  } catch (e) {
    console.error("Failed to parse pillars", e);
  }

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full h-[80vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        {mediaUrl ? (
          <div className="absolute inset-0 z-0">
            <Image
              src={mediaUrl}
              alt={headline}
              fill
              className="object-cover"
              priority
            />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-muted" />
        )}
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <h1 className={`text-4xl md:text-6xl font-bold tracking-tight mb-6 ${mediaUrl ? 'text-white' : 'text-foreground'}`}>
            {headline}
          </h1>
          <p className={`text-lg md:text-xl mb-10 max-w-2xl ${mediaUrl ? 'text-gray-200' : 'text-muted-foreground'}`}>
            {subline}
          </p>
          <Button render={<Link href={ctaUrl} />} size="lg" className="h-12 px-8 text-base">
            {ctaText}
          </Button>
        </div>
      </section>

      {/* Why Solid Wood Matters Section */}
      {pillars.length > 0 && (
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Why Solid Wood Matters</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover the difference that genuine, high-quality materials make in your home.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {pillars.map((pillar: any, index: number) => (
                <div key={index} className="flex flex-col items-center text-center p-6 border rounded-lg bg-card">
                  {/* Placeholder for Icon - using simple styling since icons aren't strictly defined */}
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-xl font-bold text-primary">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{pillar.title}</h3>
                  <p className="text-muted-foreground">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
