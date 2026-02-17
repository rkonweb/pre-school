import { Mail, Phone, MapPin, Twitter, Linkedin, Facebook, Instagram } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { name: "Features", href: "#product" },
      { name: "Pricing", href: "#pricing" },
      { name: "Curriculum", href: "#curriculum" },
      { name: "Solutions", href: "#solutions" }
    ],
    Company: [
      { name: "About Us", href: "#about" },
      { name: "Careers", href: "#careers" },
      { name: "Blog", href: "#blog" },
      { name: "Press Kit", href: "#press" }
    ],
    Resources: [
      { name: "Documentation", href: "#docs" },
      { name: "Help Center", href: "#help" },
      { name: "Case Studies", href: "#cases" },
      { name: "Webinars", href: "#webinars" }
    ],
    Legal: [
      { name: "Privacy Policy", href: "#privacy" },
      { name: "Terms of Service", href: "#terms" },
      { name: "Cookie Policy", href: "#cookies" },
      { name: "GDPR", href: "#gdpr" }
    ]
  };

  return (
    <footer id="contact" className="bg-slate-950 text-slate-300 border-t border-teal-400/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Top Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 shadow-lg shadow-teal-400/30">
                <span className="text-xl font-bold text-slate-900">🧠</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-none text-teal-300">Bodhi Board</span>
                <span className="text-xs text-teal-200/70">by Little Chanakyas</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-xs">
              The complete operating system for modern schools. Built by educators, for educators.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="#" className="h-9 w-9 rounded-lg bg-slate-900 hover:bg-gradient-to-br hover:from-teal-400 hover:to-cyan-500 flex items-center justify-center transition-all border border-slate-800 hover:border-teal-400">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-lg bg-slate-900 hover:bg-gradient-to-br hover:from-teal-400 hover:to-cyan-500 flex items-center justify-center transition-all border border-slate-800 hover:border-teal-400">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-lg bg-slate-900 hover:bg-gradient-to-br hover:from-teal-400 hover:to-cyan-500 flex items-center justify-center transition-all border border-slate-800 hover:border-teal-400">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-lg bg-slate-900 hover:bg-gradient-to-br hover:from-teal-400 hover:to-cyan-500 flex items-center justify-center transition-all border border-slate-800 hover:border-teal-400">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <h3 className="text-sm font-semibold text-teal-300 uppercase tracking-wider">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href} 
                      className="text-sm text-slate-400 hover:text-teal-300 transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="border-t border-slate-800 pt-8 mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-900 border border-teal-400/30 flex items-center justify-center">
                <Mail className="h-5 w-5 text-teal-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-sm text-teal-300">hello@bodhiboard.in</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-900 border border-teal-400/30 flex items-center justify-center">
                <Phone className="h-5 w-5 text-teal-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Phone</p>
                <p className="text-sm text-teal-300">+91 XXXX XXXXXX</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-900 border border-teal-400/30 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-teal-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Location</p>
                <p className="text-sm text-teal-300">India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © {currentYear} Bodhi Board by Little Chanakyas. All rights reserved.
            </p>
            <p className="text-sm text-slate-500">
              Made with <span className="text-teal-400">❤️</span> in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
