export const metadata = {
  title: "Shipping & Returns - Draveta Furniture",
  description:
    "How shipping and returns work for retail (Amazon/Etsy) orders and for wholesale/trade orders placed directly with Draveta.",
};

export default function ShippingReturnsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold tracking-tight mb-4">
        Shipping &amp; Returns
      </h1>
      <p className="text-muted-foreground mb-10">
        How your order is shipped and returned depends on where you buy. Draveta
        does not sell or take payment directly on this website — retail purchases
        are completed on Amazon or Etsy, and wholesale orders are invoiced and
        shipped by us.
      </p>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h2>Retail orders (Amazon &amp; Etsy)</h2>
        <p>
          When you tap <strong>“Buy on Amazon”</strong> or{" "}
          <strong>“Buy on Etsy”</strong>, your purchase, payment, delivery, and
          returns are handled entirely by that marketplace under{" "}
          <em>their</em> policies — not this page.
        </p>
        <ul>
          <li>
            <strong>Shipping timelines &amp; costs</strong> are shown at checkout
            on Amazon/Etsy and depend on the seller and your location.
          </li>
          <li>
            <strong>Returns &amp; refunds</strong> follow the marketplace&apos;s
            return window and process. Start a return from your Amazon/Etsy order
            history, not from Draveta.
          </li>
          <li>
            <strong>Damaged in transit?</strong> Report it through the
            marketplace&apos;s damage/replacement flow within their stated window.
          </li>
        </ul>

        <h2>Wholesale &amp; trade orders (direct from Draveta)</h2>
        <p>
          Approved{" "}
          <a href="/b2b/apply">trade accounts</a> place Order Requests through the
          B2B portal. These are fulfilled directly by Draveta against an invoice,
          and the terms below apply.
        </p>
        <ul>
          <li>
            <strong>Lead time:</strong> In-stock lines typically dispatch within
            3–5 business days of a confirmed invoice. Made-to-order and contract
            volumes are quoted per order (commonly 4–6 weeks).
          </li>
          <li>
            <strong>Freight:</strong> Delivery is quoted on the invoice based on
            destination, volume, and access. Large items ship via specialised
            furniture carriers.
          </li>
          <li>
            <strong>Inspection:</strong> Please inspect on delivery and note any
            damage on the carrier&apos;s receipt. Report issues with photos within
            48 hours of delivery.
          </li>
          <li>
            <strong>Returns:</strong> Standard catalogue items may be returned in
            original condition within 14 days of delivery; return freight and a
            restocking fee may apply. Custom, made-to-order, and contract pieces
            are non-returnable.
          </li>
        </ul>

        <h2>Questions?</h2>
        <p>
          For anything about a wholesale order, <a href="/contact">contact us</a>.
          For a retail order, please reach out through the Amazon or Etsy order
          you placed so the marketplace can assist you directly.
        </p>
      </div>
    </div>
  );
}
