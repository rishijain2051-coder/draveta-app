export const metadata = {
  title: "Shipping & Returns - Draveta Furniture",
  description: "Information regarding shipping timelines, delivery costs, and our return policy.",
};

export default function ShippingReturnsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Shipping & Returns</h1>
      
      <div className="prose prose-lg dark:prose-invert">
        <h2>Shipping Policy</h2>
        <p>
          At Draveta Furniture, we take great care in packaging and shipping your solid wood furniture to ensure it arrives in pristine condition.
        </p>
        <ul>
          <li><strong>Processing Time:</strong> In-stock items typically ship within 3-5 business days. Made-to-order or custom pieces may take 4-6 weeks to craft before shipping.</li>
          <li><strong>Shipping Costs:</strong> Shipping costs are calculated at checkout based on the delivery location and the weight of the items.</li>
          <li><strong>Delivery Methods:</strong> We partner with specialized furniture carriers for large items to ensure safe handling. Small items may be shipped via standard parcel services.</li>
        </ul>

        <h2>Return Policy</h2>
        <p>
          We want you to be completely satisfied with your purchase. If for any reason you are not, we accept returns under the following conditions:
        </p>
        <ul>
          <li><strong>Timeframe:</strong> Returns must be initiated within 14 days of delivery.</li>
          <li><strong>Condition:</strong> Items must be returned in their original condition and packaging. Used or damaged items (unless damaged in transit) are not eligible for a refund.</li>
          <li><strong>Restocking Fee:</strong> A 15% restocking fee applies to all returned furniture.</li>
          <li><strong>Return Shipping:</strong> Customers are responsible for return shipping costs.</li>
          <li><strong>Custom Orders:</strong> Custom or made-to-order pieces are final sale and cannot be returned.</li>
        </ul>

        <h2>Damaged Items</h2>
        <p>
          Please inspect your furniture immediately upon delivery. If you notice any damage, please note it on the delivery receipt and contact us within 48 hours with photos of the damage and packaging. We will work swiftly to resolve the issue.
        </p>
      </div>
    </div>
  );
}
