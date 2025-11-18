
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Activity, Globe, Users, Zap, Clock, Shield } from "lucide-react";

const NetworkInsights = () => {
  const usageData = [
    { route: "Angola ↔ Portugal", usage: "2.3M minutes", trend: "up", growth: "+15%" },
    { route: "Cape Verde ↔ USA", usage: "1.8M minutes", trend: "up", growth: "+22%" },
    { route: "Mozambique ↔ South Africa", usage: "1.5M minutes", trend: "up", growth: "+8%" },
    { route: "Guinea-Bissau ↔ France", usage: "890K minutes", trend: "up", growth: "+12%" },
    { route: "São Tomé ↔ Brazil", usage: "650K minutes", trend: "up", growth: "+18%" }
  ];

  const performanceMetrics = [
    { metric: "Network Uptime", value: "99.94%", change: "+0.2%", status: "excellent" },
    { metric: "Average Speed", value: "82 Mbps", change: "+12%", status: "excellent" },
    { metric: "Connection Success", value: "98.7%", change: "+1.1%", status: "good" },
    { metric: "Customer Satisfaction", value: "4.7/5", change: "+0.3", status: "excellent" }
  ];

  const seasonalTrends = [
    { period: "Holiday Season", peak: "December-January", usage: "+45%", description: "Family connections during festive periods" },
    { period: "Summer Travel", peak: "July-August", usage: "+30%", description: "Tourism and diaspora visits increase" },
    { period: "Business Quarter", peak: "March-May", usage: "+20%", description: "Corporate travel and conferences" },
    { period: "Cultural Events", peak: "Various", usage: "+25%", description: "Independence days and cultural celebrations" }
  ];

  const futureRoadmap = [
    { year: "2024", milestone: "5G Expansion", description: "5G rollout in major cities across all PALOP countries" },
    { year: "2025", milestone: "Rural Coverage", description: "Enhanced rural connectivity reaching 95% population coverage" },
    { year: "2026", milestone: "Smart Integration", description: "IoT and smart city infrastructure partnerships" },
    { year: "2027", milestone: "Satellite Backup", description: "Satellite connectivity for remote areas and disaster recovery" }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Network Insights & Analytics</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Data-driven insights into PALOP connectivity patterns, performance metrics, and future infrastructure development.
          </p>
        </div>

        <Tabs defaultValue="usage" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="trends">Seasonal Trends</TabsTrigger>
            <TabsTrigger value="roadmap">Future Roadmap</TabsTrigger>
          </TabsList>

          <TabsContent value="usage" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Activity className="h-8 w-8 text-palop-green mx-auto mb-2" />
                  <div className="text-2xl font-bold">8.2M</div>
                  <div className="text-sm text-gray-600">Total Minutes/Month</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Users className="h-8 w-8 text-palop-blue mx-auto mb-2" />
                  <div className="text-2xl font-bold">45K+</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Globe className="h-8 w-8 text-palop-yellow mx-auto mb-2" />
                  <div className="text-2xl font-bold">127</div>
                  <div className="text-sm text-gray-600">Countries Reached</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <TrendingUp className="h-8 w-8 text-palop-green mx-auto mb-2" />
                  <div className="text-2xl font-bold">+18%</div>
                  <div className="text-sm text-gray-600">Monthly Growth</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Popular Communication Routes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usageData.map((route, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{route.route}</div>
                        <div className="text-sm text-gray-600">{route.usage} monthly</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-palop-green font-medium">{route.growth}</span>
                        <TrendingUp className="h-4 w-4 text-palop-green" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {performanceMetrics.map((metric, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{metric.metric}</span>
                      <div className={`flex items-center space-x-1 ${
                        metric.status === 'excellent' ? 'text-palop-green' : 'text-palop-blue'
                      }`}>
                        <span className="text-xs">{metric.change}</span>
                        <TrendingUp className="h-3 w-3" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${
                          metric.status === 'excellent' ? 'bg-palop-green' : 'bg-palop-blue'
                        }`}
                        style={{ width: metric.status === 'excellent' ? '95%' : '85%' }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-palop-green" />
                  Network Reliability by Country
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["Cape Verde: 99.1%", "Angola: 98.2%", "São Tomé: 98.7%", "Mozambique: 97.5%", "Guinea-Bissau: 96.8%"].map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{item.split(':')[0]}</span>
                      <span className="font-bold text-palop-green">{item.split(':')[1]}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {seasonalTrends.map((trend, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{trend.period}</h3>
                      <span className="text-palop-green font-bold">{trend.usage}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">Peak: {trend.peak}</div>
                    <p className="text-sm text-gray-700">{trend.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="roadmap" className="space-y-6">
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-palop-green/30"></div>
              <div className="space-y-8">
                {futureRoadmap.map((item, index) => (
                  <div key={index} className="relative flex items-start">
                    <div className="absolute left-0 w-8 h-8 bg-palop-green rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="ml-12">
                      <div className="flex items-center space-x-4 mb-2">
                        <span className="text-lg font-bold text-palop-green">{item.year}</span>
                        <h3 className="text-lg font-semibold">{item.milestone}</h3>
                      </div>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default NetworkInsights;
