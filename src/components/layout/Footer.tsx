import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-muted py-12 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-xl font-bold tracking-tight">Draveta Furniture</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Solid wood furniture built for the Indian market, crafted to last generations.
            </p>
            <div className="flex gap-4">
              <a href="#" aria-label="Instagram" className="text-muted-foreground hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="#" aria-label="Facebook" className="text-muted-foreground hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm tracking-wider uppercase">Shop</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/collections/living" className="hover:text-foreground">Living Room</Link></li>
              <li><Link href="/collections/dining" className="hover:text-foreground">Dining Room</Link></li>
              <li><Link href="/collections/bedroom" className="hover:text-foreground">Bedroom</Link></li>
              <li><Link href="/collections/outdoor" className="hover:text-foreground">Outdoor</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm tracking-wider uppercase">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
              <li><Link href="/b2b/apply" className="hover:text-foreground">Trade Program</Link></li>
              <li><Link href="/affiliate/apply" className="hover:text-foreground">Affiliates</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm tracking-wider uppercase">Legal & Help</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/shipping-returns" className="hover:text-foreground">Shipping & Returns</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
            </ul>
          </div>

        </div>
        
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Draveta Furniture. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
