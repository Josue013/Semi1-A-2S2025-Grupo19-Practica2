import {
  ChefHat,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
} from "lucide-react";

const Footer = () => {
  const footerLinks = [
    {
      title: "Recetas",
      links: [
        { text: "Desayunos", url: "/recipes/desayunos" },
        { text: "Almuerzos", url: "/recipes/almuerzos" },
        { text: "Cenas", url: "/recipes/cenas" },
        { text: "Postres", url: "/recipes/postres" },
        { text: "Bebidas", url: "/recipes/bebidas" },
      ],
    },
    {
      title: "Comunidad",
      links: [
        { text: "Crear Receta", url: "/create-recipe" },
        { text: "Mis Recetas", url: "/my-recipes" },
        { text: "Favoritos", url: "/favorites" },
        { text: "Chefs Destacados", url: "/chefs" },
      ],
    },
    {
      title: "Soporte",
      links: [
        { text: "Centro de Ayuda", url: "/help" },
        { text: "Contacto", url: "/contact" },
        { text: "Términos de Uso", url: "/terms" },
        { text: "Política de Privacidad", url: "/privacy" },
      ],
    },
  ];

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-32 mt-24 bg-orange-50">
      <div className="flex flex-col md:flex-row items-start justify-between gap-10 py-10 border-b border-orange-200 text-gray-600">
        {/* Logo y descripción */}
        <div className="max-w-md">
          <div className="flex items-center gap-2 mb-4">
            <ChefHat className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold text-gray-800">
              <span className="text-orange-500">Sabor</span>Conecta
            </span>
          </div>
          <p className="text-gray-600 leading-relaxed mb-6">
            Descubre y comparte las mejores recetas caseras. Una plataforma
            donde los sabores conectan corazones y las tradiciones culinarias se
            mantienen vivas. ¡Únete a nuestra comunidad gastronómica!
          </p>

          {/* Información de contacto */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-orange-500" />
              <span>info@saborconecta.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-orange-500" />
              <span>+502 2234-5678</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span>Guatemala, Guatemala</span>
            </div>
          </div>
        </div>

        {/* Enlaces */}
        <div className="flex flex-wrap justify-between w-full md:w-[60%] gap-8">
          {footerLinks.map((section, index) => (
            <div key={index} className="min-w-[150px]">
              <h3 className="font-semibold text-base text-gray-800 mb-4">
                {section.title}
              </h3>
              <ul className="text-sm space-y-2">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.url}
                      className="hover:text-orange-500 transition-colors duration-200"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Footer inferior */}
      <div className="py-6 flex flex-col md:flex-row items-center justify-between">
        <p className="text-sm text-gray-500 mb-4 md:mb-0">
          Copyright {new Date().getFullYear()} © SaborConecta - Grupo 19. Todos
          los derechos reservados.
        </p>

        {/* Redes sociales */}
        <div className="flex items-center gap-4">
          <a
            href="#"
            className="w-8 h-8 bg-orange-100 hover:bg-orange-200 rounded-full flex items-center justify-center transition-colors"
            aria-label="Facebook"
          >
            <Facebook className="w-4 h-4 text-orange-600" />
          </a>
          <a
            href="#"
            className="w-8 h-8 bg-orange-100 hover:bg-orange-200 rounded-full flex items-center justify-center transition-colors"
            aria-label="Instagram"
          >
            <Instagram className="w-4 h-4 text-orange-600" />
          </a>
          <a
            href="#"
            className="w-8 h-8 bg-orange-100 hover:bg-orange-200 rounded-full flex items-center justify-center transition-colors"
            aria-label="Twitter"
          >
            <Twitter className="w-4 h-4 text-orange-600" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Footer;
