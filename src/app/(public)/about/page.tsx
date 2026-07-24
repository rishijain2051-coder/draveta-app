export const metadata = {
  title: "About Us - Draveta Furniture",
  description: "Learn about Draveta Furniture, our heritage, and our commitment to crafting timeless solid wood furniture.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold tracking-tight mb-8">About Draveta Furniture</h1>
      
      <div className="prose prose-lg dark:prose-invert">
        <p>
          Founded with a passion for exceptional craftsmanship, Draveta Furniture is dedicated to creating solid wood pieces that stand the test of time. We believe that furniture should not just be functional, but a timeless addition to your home that carries stories from one generation to the next.
        </p>

        <h2>Our Heritage</h2>
        <p>
          Our journey began in a small workshop where traditional woodworking techniques were passed down. Today, we combine these time-honored methods with modern design sensibilities to produce furniture that is both durable and elegant. Every piece is handcrafted by skilled artisans who take immense pride in their work.
        </p>

        <h2>Commitment to Sustainability</h2>
        <p>
          We source our wood responsibly, ensuring that our environmental footprint is as light as possible. Solid wood is inherently sustainable when sourced correctly, and its longevity means fewer resources are consumed over time compared to fast furniture.
        </p>

        <h2>The Draveta Promise</h2>
        <p>
          When you purchase from Draveta Furniture, you are investing in quality. We stand behind every table, chair, and bed we create. Our goal is to bring the warmth, character, and enduring beauty of solid wood into your everyday life.
        </p>
      </div>
    </div>
  );
}
