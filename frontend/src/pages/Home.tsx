import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Brain, Network, Search, Filter, BarChart3, Globe, Zap, Rocket } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            SpaceBio Knowledge
            <br />
            <span className="text-4xl md:text-6xl text-primary-glow">
              Graph Explorer
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Explore the interconnected world of space biology research through our immersive 3D knowledge graph. 
            Discover relationships between experiments, organisms, pathways, and environmental factors.
          </p>
          
          <div className="flex justify-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground glow-primary transition-smooth px-8 py-4 text-lg transform hover:scale-105">
              <Link to="/explorer">
                <Rocket className="w-5 h-5 mr-2" />
                Launch Explorer
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-primary transition-smooth hover:shadow-lg hover:shadow-primary/20 group">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-smooth">
                <Network className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-card-foreground group-hover:text-primary transition-smooth">3D Visualization</CardTitle>
              <CardDescription className="text-muted-foreground group-hover:text-foreground transition-smooth">
                Navigate through complex biological relationships in an immersive 3D environment
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-primary transition-smooth hover:shadow-lg hover:shadow-primary/20 group">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-smooth">
                <Search className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-card-foreground group-hover:text-primary transition-smooth">Semantic Search</CardTitle>
              <CardDescription className="text-muted-foreground group-hover:text-foreground transition-smooth">
                Find relevant research using natural language queries and AI-powered search
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-primary transition-smooth hover:shadow-lg hover:shadow-primary/20 group">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-smooth">
                <Filter className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-card-foreground group-hover:text-primary transition-smooth">Advanced Filtering</CardTitle>
              <CardDescription className="text-muted-foreground group-hover:text-foreground transition-smooth">
                Filter by year, environment, organism type, and research categories
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-primary transition-smooth hover:shadow-lg hover:shadow-primary/20 group">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-smooth">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-card-foreground group-hover:text-primary transition-smooth">Analytics Dashboard</CardTitle>
              <CardDescription className="text-muted-foreground group-hover:text-foreground transition-smooth">
                View graph statistics and identify the most connected research nodes
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-primary transition-smooth hover:shadow-lg hover:shadow-primary/20 group">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-smooth">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-card-foreground group-hover:text-primary transition-smooth">Space Environments</CardTitle>
              <CardDescription className="text-muted-foreground group-hover:text-foreground transition-smooth">
                Explore research conducted in lunar, Martian, and microgravity environments
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-primary transition-smooth hover:shadow-lg hover:shadow-primary/20 group">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-smooth">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-card-foreground group-hover:text-primary transition-smooth">Real-time Updates</CardTitle>
              <CardDescription className="text-muted-foreground group-hover:text-foreground transition-smooth">
                Stay current with the latest space biology research and discoveries
              </CardDescription>
            </CardHeader>
          </Card>
        </div>


      </div>
    </div>
  );
};

export default Home;
