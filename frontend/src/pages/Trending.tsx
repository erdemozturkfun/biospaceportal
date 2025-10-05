import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

const trendingTopics = [
    { title: "Microbial life", },
    { title: "Spaceflight immunity", },
    { title: "Plant defense signaling", },
    { title: "Plants in Space", },
    { title: "Frailty genes", },
];

const rareTopics = [
    { title: "Miella strains", },
    { title: "Evolution and microgravity", },
    { title: "Cow rumens", },
    { title: "Genomes and microgravity", },
    { title: "Microgravity fungal biofilm", },
];

const Trending = () => {
    return (
        <div className="max-w-3xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-8 text-center">Trending Concepts</h1>
            <Button asChild size="lg" className="bg-gray-500 hover:bg-gray-700 text-primary-foreground  transition-smooth px-4 py-2 text-lg transform hover:scale-105">
                <Link to="/">
                    Go Back
                </Link>

            </Button>
            <div className="mb-10">
                <h2 className="text-xl font-semibold mb-4 text-primary">Top 5 Trending Topics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {trendingTopics.map((topic, idx) => (
                        <Card key={idx} className="p-5 bg-card border-border">
                            <h3 className="text-lg font-semibold mb-2">{topic.title}</h3>
                        </Card>
                    ))}
                </div>
            </div>
            <div>
                <h2 className="text-xl font-semibold mb-4 text-primary">5 Rarely Studied Topics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {rareTopics.map((topic, idx) => (
                        <Card key={idx} className="p-5 bg-card border-border">
                            <h3 className="text-lg font-semibold mb-2">{topic.title}</h3>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Trending;