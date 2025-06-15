
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Quote, Heart, Users, Globe, ArrowRight } from "lucide-react";
import { useState } from "react";

const CommunityStories = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const memberStories = [
    {
      id: 1,
      name: "Carlos Mendes",
      location: "Amsterdam, Netherlands",
      country: "Angola",
      flag: "🇦🇴",
      category: "Business",
      title: "From Luanda to Amsterdam: Building Bridges",
      story: "Through PALOP Roam Connect, I found investors for my sustainable energy startup. The network helped me connect with other Angolan entrepreneurs across Europe, and now we're planning to expand back to Angola.",
      image: "/placeholder.svg",
      impact: "Raised €250K in funding",
      connections: 45,
      yearsInDiaspora: 8
    },
    {
      id: 2,
      name: "Fatima Santos",
      location: "Brussels, Belgium",
      country: "Cape Verde",
      flag: "🇨🇻",
      category: "Culture",
      title: "Preserving Creole Heritage in Europe",
      story: "I started a Cape Verdean language school for diaspora children. The community supported me with students, teachers, and even helped find our beautiful school space in the heart of Brussels.",
      image: "/placeholder.svg",
      impact: "Teaching 120+ children",
      connections: 67,
      yearsInDiaspora: 12
    },
    {
      id: 3,
      name: "Ricardo Silva",
      location: "Milan, Italy",
      country: "Mozambique",
      flag: "🇲🇿",
      category: "Technology",
      title: "Coding for Community Development",
      story: "As a software engineer, I created an app connecting Mozambican diaspora worldwide. It started as a personal project but grew into a platform used by thousands of families to stay in touch.",
      image: "/placeholder.svg",
      impact: "10K+ app downloads",
      connections: 89,
      yearsInDiaspora: 6
    },
    {
      id: 4,
      name: "Isabel Gomes",
      location: "Stockholm, Sweden",
      country: "Guinea-Bissau",
      flag: "🇬🇼",
      category: "Education",
      title: "Mentoring the Next Generation",
      story: "I mentor young Guinea-Bissauan students in STEM fields. Through our network, I've helped 15 students get scholarships to European universities, keeping them connected to their roots.",
      image: "/placeholder.svg",
      impact: "15 students mentored",
      connections: 34,
      yearsInDiaspora: 15
    },
    {
      id: 5,
      name: "Miguel Tavares",
      location: "Madrid, Spain",
      country: "São Tomé and Príncipe",
      flag: "🇸🇹",
      category: "Culture",
      title: "São Toméan Flavors in Madrid",
      story: "My restaurant became a cultural hub for our community. We host events, celebrate São Toméan holidays, and even teach traditional cooking. It's more than food - it's preserving our heritage.",
      image: "/placeholder.svg",
      impact: "5K+ meals served",
      connections: 78,
      yearsInDiaspora: 9
    },
    {
      id: 6,
      name: "Ana Rodrigues",
      location: "Vienna, Austria",
      country: "Cape Verde",
      flag: "🇨🇻",
      category: "Healthcare",
      title: "Healing Hearts, Connecting Cultures",
      story: "As a nurse, I created a support group for PALOP families dealing with health challenges. We share resources, offer emotional support, and ensure no one faces difficult times alone.",
      image: "/placeholder.svg",
      impact: "200+ families helped",
      connections: 156,
      yearsInDiaspora: 11
    }
  ];

  const categories = ["All", "Business", "Culture", "Technology", "Education", "Healthcare"];

  const filteredStories = activeCategory === "All" 
    ? memberStories 
    : memberStories.filter(story => story.category === activeCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Business':
        return 'bg-palop-blue/10 text-palop-blue';
      case 'Culture':
        return 'bg-palop-green/10 text-palop-green';
      case 'Technology':
        return 'bg-purple-100 text-purple-600';
      case 'Education':
        return 'bg-palop-yellow/10 text-palop-dark';
      case 'Healthcare':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Community Success Stories</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Real stories from PALOP community members who found connection, support, and success through our network. 
            Every story represents the power of unity and shared heritage.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category)}
              className={activeCategory === category 
                ? "bg-palop-green hover:bg-palop-green/90" 
                : "border-palop-green text-palop-green hover:bg-palop-green hover:text-white"
              }
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredStories.map((story) => (
            <Card key={story.id} className="hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-6">
                {/* Header with Quote Icon */}
                <div className="flex justify-between items-start mb-4">
                  <Quote className="h-8 w-8 text-palop-green/20" />
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(story.category)}`}>
                    {story.category}
                  </span>
                </div>

                {/* Member Info */}
                <div className="flex items-center mb-4">
                  <Avatar className="h-12 w-12 mr-3">
                    <AvatarImage src={story.image} alt={story.name} />
                    <AvatarFallback className="bg-palop-green text-white">
                      {story.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-lg flex items-center">
                      {story.flag} {story.name}
                    </h3>
                    <p className="text-sm text-gray-500">{story.location}</p>
                    <p className="text-xs text-gray-400">{story.yearsInDiaspora} years in diaspora</p>
                  </div>
                </div>

                {/* Story Title */}
                <h4 className="font-semibold text-palop-green mb-3">{story.title}</h4>

                {/* Story Content */}
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  {story.story}
                </p>

                {/* Impact Metrics */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center text-sm text-palop-blue">
                    <Heart className="h-4 w-4 mr-2" />
                    <span className="font-semibold">{story.impact}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{story.connections} community connections</span>
                  </div>
                </div>

                {/* Read More Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-4 text-palop-green hover:bg-palop-green/10 group-hover:translate-x-1 transition-transform"
                >
                  Read Full Story
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Community Stats */}
        <div className="mt-16 bg-gradient-to-r from-palop-green/10 via-palop-yellow/10 to-palop-blue/10 rounded-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-palop-green">500+</div>
              <div className="text-sm text-gray-600">Success Stories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-palop-blue">€2.5M+</div>
              <div className="text-sm text-gray-600">Community Impact</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-palop-green">25K+</div>
              <div className="text-sm text-gray-600">Lives Touched</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-palop-blue">15</div>
              <div className="text-sm text-gray-600">Cities Connected</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold mb-4">Share Your Story</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Have a success story or meaningful connection through our community? We'd love to hear from you and inspire others.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button className="bg-palop-green hover:bg-palop-green/90">
              Submit Your Story
            </Button>
            <Button variant="outline" className="border-palop-green text-palop-green hover:bg-palop-green/10">
              View All Stories
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunityStories;
