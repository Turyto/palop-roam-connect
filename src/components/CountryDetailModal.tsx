
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CountryOverviewTab from "./modal/CountryOverviewTab";
import CountryCoverageTab from "./modal/CountryCoverageTab";
import CountryCultureTab from "./modal/CountryCultureTab";
import CountryReviewsTab from "./modal/CountryReviewsTab";

interface CountryDetailModalProps {
  country: any;
  isOpen: boolean;
  onClose: () => void;
}

const CountryDetailModal = ({ country, isOpen, onClose }: CountryDetailModalProps) => {
  if (!country) return null;

  const networkQuality = {
    "Angola": { speed: "85 Mbps", latency: "45ms", reliability: "98.2%" },
    "Cape Verde": { speed: "92 Mbps", latency: "38ms", reliability: "99.1%" },
    "Guinea-Bissau": { speed: "67 Mbps", latency: "52ms", reliability: "96.8%" },
    "Mozambique": { speed: "78 Mbps", latency: "48ms", reliability: "97.5%" },
    "São Tomé and Príncipe": { speed: "88 Mbps", latency: "42ms", reliability: "98.7%" }
  };

  const hotspots = {
    "Angola": ["Luanda Airport", "Talatona Business District", "Marginal Promenade", "Shopping Belas"],
    "Cape Verde": ["Amílcar Cabral Airport", "Mindelo Marina", "Praia City Center", "Santa Maria Beach"],
    "Guinea-Bissau": ["Bissau Airport", "Bissau Port", "Hotel Malaika", "Central Market"],
    "Mozambique": ["Maputo Airport", "Costa do Sol", "Polana Shopping", "Matola Business District"],
    "São Tomé and Príncipe": ["São Tomé Airport", "Ana Chaves Bay", "Hotel Pestana", "Central Hospital"]
  };

  const cultureData = {
    "Mozambique": {
      "countryCode": "MZ",
      "countryName": "Mozambique",
      "languageSection": {
        "primaryLanguages": ["Portuguese", "Emakhuwa"],
        "commonPhrases": [
          { "phrase": "Bom dia", "meaning": "Good morning", "phonetic": "bohm DEE-ah" },
          { "phrase": "Obrigado/a", "meaning": "Thank you", "phonetic": "oh-bree-GAH-doo" }
        ],
        "etiquetteNote": "Greet people politely; show respect in traditional communities."
      },
      "eventsSection": [
        { "eventName": "AZGO Festival", "description": "Annual music festival in Maputo celebrating African sounds." },
        { "eventName": "Chopi Music Festival", "description": "Traditional event featuring Chopi timbila performances." }
      ],
      "priceIndex": {
        "tourist": [
          {"item": "Street food meal", "priceExample": "€2"},
          {"item": "Bottled water", "priceExample": "€0.40"},
          {"item": "Local bus fare", "priceExample": "€0.30"}
        ],
        "business": [
          {"item": "Car rental (per day)", "priceExample": "€35"},
          {"item": "Wi-Fi (per day)", "priceExample": "€5"}
        ],
        "expat": [
          {"item": "Monthly rent (1BR)", "priceExample": "€400"},
          {"item": "Groceries (basic basket)", "priceExample": "€65"}
        ]
      },
      "tipsSection": [
        "Shop at Mercado Central for fresh produce and souvenirs.",
        "Try street food for tasty, cheap meals.",
        "Use 'Lojas Chineses' for a wide variety of low-cost goods.",
        "Avoid touristy restaurants to save money."
      ],
      "dataSources": ["REST Countries", "Tatoeba", "Nager.Date", "Open Food Facts"]
    },
    "Angola": {
      "languageSection": {
        "primaryLanguages": ["Portuguese", "Kimbundu"],
        "commonPhrases": [
          { "phrase": "Bom dia", "meaning": "Good morning", "phonetic": "bohm DEE-ah" },
          { "phrase": "Obrigado/a", "meaning": "Thank you", "phonetic": "oh-bree-GAH-doo" }
        ],
        "etiquetteNote": "Respect for elders is very important; greet with a handshake."
      },
      "eventsSection": [
        { "eventName": "Luanda Jazz Festival", "description": "International jazz festival attracting world-class musicians." },
        { "eventName": "Carnival of Luanda", "description": "Vibrant street celebration with music and dance." }
      ],
      "priceIndex": {
        "tourist": [
          {"item": "Street food meal", "priceExample": "€3"},
          {"item": "Bottled water", "priceExample": "€0.50"},
          {"item": "Local transport", "priceExample": "€0.40"}
        ],
        "business": [
          {"item": "Hotel room", "priceExample": "€80"},
          {"item": "Business lunch", "priceExample": "€15"}
        ],
        "expat": [
          {"item": "Monthly rent", "priceExample": "€800"},
          {"item": "Groceries", "priceExample": "€120"}
        ]
      },
      "tipsSection": [
        "Luanda can be expensive; budget accordingly.",
        "Try local markets for authentic experiences.",
        "Cash is preferred in many places.",
        "Learn basic Portuguese phrases."
      ],
      "culturalConnectivity": "Home to vibrant semba and kizomba music. Stay connected to share your Luanda nightlife experiences and Benguela's beautiful coastline.",
      "bestTimesToVisit": [
        {
          "season": "Dry Season (May–October)",
          "description": "Best weather for exploring Luanda and coastal areas with comfortable temperatures."
        },
        {
          "season": "Festival Season (February–April)", 
          "description": "Carnival season with vibrant cultural celebrations and music festivals."
        }
      ],
      "dataSources": ["REST Countries", "Tatoeba", "Nager.Date", "Open Food Facts"]
    },
    "Cape Verde": {
      "countryCode": "CV",
      "countryName": "Cape Verde",
      "languageSection": {
        "primaryLanguages": ["Portuguese", "Cape Verdean Creole"],
        "commonPhrases": [
          { "phrase": "Bon dia", "meaning": "Good morning", "phonetic": "bohn DEE-ah" },
          { "phrase": "Obrigadu", "meaning": "Thank you", "phonetic": "oh-bree-GAH-doo" }
        ],
        "etiquetteNote": "Speak a few words in Cape Verdean Creole – locals appreciate it."
      },
      "eventsSection": [
        { "eventName": "Gamboa Music Festival (Praia)", "description": "Cape Verde's iconic music celebration in May" },
        { "eventName": "Independence Day (5 July)", "description": "Nationwide festivities, parades, and concerts" },
        { "eventName": "Carnival (Mindelo)", "description": "One of the most vibrant in Africa, full of dance and color" },
        { "eventName": "Tabanka Festival", "description": "Cultural reenactments and music across islands" }
      ],
      "priceIndex": {
        "tourist": [
          {"item": "Local meal", "priceExample": "€8"},
          {"item": "Bottled water", "priceExample": "€1"},
          {"item": "Aluguer (shared taxi)", "priceExample": "€1.50"}
        ],
        "business": [
          {"item": "Inter-island flight", "priceExample": "€80"},
          {"item": "Hotel room", "priceExample": "€60"}
        ],
        "expat": [
          {"item": "Monthly rent (1BR)", "priceExample": "€300"},
          {"item": "Groceries", "priceExample": "€80"}
        ]
      },
      "tipsSection": [
        "Use shared taxis or 'aluguers' for budget-friendly island travel.",
        "Eat at local 'lanchonetes' or street food stalls for tasty, affordable meals.",
        "Book inter-island flights in advance – limited seats during festivals.",
        "Festival Season (May–August): Enjoy music festivals and vibrant street parades."
      ],
      "culturalConnectivity": "A unique blend of African and Portuguese heritage, Cape Verde offers a warm, music-rich culture that shines through its morna, batuque rhythms, and island hospitality. From São Vicente's artistic pulse to Santiago's historical roots, each island tells a story.",
      "bestTimesToVisit": [
        {
          "season": "Festival Season (May–August)",
          "description": "Enjoy music festivals and vibrant street parades across Santiago, São Vicente, and Sal islands."
        },
        {
          "season": "Off Season (October–November)", 
          "description": "Quieter beaches, local immersion, and better value on flights and accommodation."
        }
      ],
      "dataSources": ["REST Countries", "Tatoeba", "Nager.Date", "Open Food Facts"]
    },
    "São Tomé and Príncipe": {
      "countryCode": "ST",
      "countryName": "São Tomé and Príncipe",
      "languageSection": {
        "primaryLanguages": ["Portuguese", "Forro"],
        "commonPhrases": [
          { "phrase": "Bom dia", "meaning": "Good morning", "phonetic": "bohm DEE-ah" },
          { "phrase": "Obrigado/a", "meaning": "Thank you", "phonetic": "oh-bree-GAH-doo" }
        ],
        "etiquetteNote": "Learn Forro basics to connect with locals."
      },
      "eventsSection": [
        { "eventName": "Santo António Festival (13 June)", "description": "Local saints, street food, parades" },
        { "eventName": "Independence Day (12 July)", "description": "Patriotic music and national pride" },
        { "eventName": "São Lourenço Festival (August)", "description": "Island-wide celebration" },
        { "eventName": "Cocoa Festival", "description": "Cultural showcase and chocolate markets" }
      ],
      "priceIndex": {
        "tourist": [
          {"item": "Street food meal", "priceExample": "€4"},
          {"item": "Bottled water", "priceExample": "€0.60"},
          {"item": "Local transport", "priceExample": "€0.50"}
        ],
        "business": [
          {"item": "Hotel room", "priceExample": "€70"},
          {"item": "Car rental (per day)", "priceExample": "€40"}
        ],
        "expat": [
          {"item": "Monthly rent (1BR)", "priceExample": "€350"},
          {"item": "Groceries", "priceExample": "€90"}
        ]
      },
      "tipsSection": [
        "Learn Forro basics to connect with locals.",
        "Eat at roadside grills or stalls for fresh seafood.",
        "Use public transport or shared taxis to save money.",
        "Book flights early — limited routes and high demand during holidays."
      ],
      "culturalConnectivity": "A blend of Portuguese and African heritage, São Tomé & Príncipe is rich in Creole languages, music like Ússua and Socopé, and cocoa-based cuisine. Its calm island pace is rooted in traditions, community, and natural beauty.",
      "bestTimesToVisit": [
        {
          "season": "Low Season (April–June)",
          "description": "Lower prices, fewer tourists, lush landscapes."
        },
        {
          "season": "Festival Season (June–August)", 
          "description": "Join locals in religious and cultural parades."
        }
      ],
      "dataSources": ["REST Countries", "Tatoeba", "Nager.Date", "Open Food Facts"]
    },
    "Guinea-Bissau": {
      "countryCode": "GW",
      "countryName": "Guinea-Bissau",
      "languageSection": {
        "primaryLanguages": ["Portuguese", "Crioulo"],
        "commonPhrases": [
          { "phrase": "N'sta bem?", "meaning": "How are you?", "phonetic": "n-sta bem" },
          { "phrase": "Obrigadu", "meaning": "Thank you", "phonetic": "oh-bree-GAH-doo" }
        ],
        "etiquetteNote": "Use Crioulo greetings like 'N'sta bem?' when meeting locals."
      },
      "eventsSection": [
        { "eventName": "Carnival in Bissau", "description": "Colorful parades and community spirit" },
        { "eventName": "Bijagós Archipelago Festival", "description": "Indigenous island traditions" },
        { "eventName": "Tabanca Festival", "description": "A celebration of identity and ancestry" },
        { "eventName": "Bubaque Music Festival", "description": "Live performances under the stars" }
      ],
      "priceIndex": {
        "tourist": [
          {"item": "Street food meal", "priceExample": "€1.50"},
          {"item": "Bottled water", "priceExample": "€0.30"},
          {"item": "Local transport", "priceExample": "€0.25"}
        ],
        "business": [
          {"item": "Hotel room", "priceExample": "€45"},
          {"item": "Car rental (per day)", "priceExample": "€30"}
        ],
        "expat": [
          {"item": "Monthly rent (1BR)", "priceExample": "€250"},
          {"item": "Groceries", "priceExample": "€50"}
        ]
      },
      "tipsSection": [
        "Use Crioulo greetings like 'N'sta bem?' when meeting locals.",
        "Use 'sept-places' (shared taxis) for longer distances.",
        "Visit less touristy areas like Varela for more authenticity.",
        "Shop in open markets for best prices on food and crafts."
      ],
      "culturalConnectivity": "Guinea-Bissau's cultural identity is rooted in Crioulo language, Tabanca ceremonies, and a rich oral tradition. With strong ties to music and communal living, the country thrives on vibrant festivals and grassroots expression.",
      "bestTimesToVisit": [
        {
          "season": "Dry Season (November–May)",
          "description": "Best for beach trips, cultural tours, and comfortable travel."
        },
        {
          "season": "Carnival Season (February)", 
          "description": "Join locals in the streets for drums, dance, and celebration."
        }
      ],
      "dataSources": ["REST Countries", "Tatoeba", "Nager.Date", "Open Food Facts"]
    }
  };

  const currentCultureData = cultureData[country.name as keyof typeof cultureData] || cultureData["Angola"];

  const reviews = [
    { name: "Maria S.", rating: 5, text: "Excellent coverage in Luanda. Video calls with family were crystal clear!" },
    { name: "João P.", rating: 5, text: "Seamless roaming experience across all islands. Highly recommended!" },
    { name: "Ana L.", rating: 4, text: "Good speeds in major cities, reliable connection throughout my business trip." }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <span className="text-4xl mr-3">{country.flag}</span>
            {country.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="coverage">Coverage</TabsTrigger>
            <TabsTrigger value="culture">Culture</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <CountryOverviewTab 
              country={country}
              networkQuality={networkQuality}
              hotspots={hotspots}
            />
          </TabsContent>

          <TabsContent value="coverage">
            <CountryCoverageTab country={country} />
          </TabsContent>

          <TabsContent value="culture">
            <CountryCultureTab 
              country={country}
              cultureData={currentCultureData}
            />
          </TabsContent>

          <TabsContent value="reviews">
            <CountryReviewsTab reviews={reviews} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button className="bg-palop-green hover:bg-palop-green/90">
            View {country.name} Plans
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CountryDetailModal;
